import { AppError, notFound } from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { orNotFound } from '../../lib/prismaErrors';
import { type VehicleResponse, toVehicleResponse } from '../vehicles/vehicle.dto';
import { type PurchaseResponse, toPurchaseResponse } from './purchase.dto';

export interface PurchaseResult {
  purchase: PurchaseResponse;
  vehicle: VehicleResponse;
}

/**
 * Buys `quantity` units of a vehicle for a user (decision D5).
 *
 * Stock is reduced by a single conditional UPDATE (`... WHERE quantity >= n`), so
 * the check and the decrement happen atomically in the database: when buyers race
 * for the last unit, Postgres serialises the updates on the row lock and only one
 * of them still matches the condition. The purchase record is written in the same
 * transaction, so a sale is never recorded without its stock change or vice versa.
 */
export async function purchaseVehicle(
  userId: string,
  vehicleId: string,
  quantity: number,
): Promise<PurchaseResult> {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.vehicle.updateMany({
      where: { id: vehicleId, quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity } },
    });

    if (count === 0) {
      const current = await tx.vehicle.findUnique({ where: { id: vehicleId } });
      if (!current) throw notFound('Vehicle not found');
      if (current.quantity === 0) {
        throw new AppError(409, 'OUT_OF_STOCK', 'This vehicle is out of stock');
      }
      throw new AppError(409, 'INSUFFICIENT_STOCK', `Only ${current.quantity} left in stock`);
    }

    // Our UPDATE holds the row lock until commit, so this read is consistent with it.
    const vehicle = await tx.vehicle.findUniqueOrThrow({ where: { id: vehicleId } });
    const purchase = await tx.purchase.create({
      data: {
        userId,
        vehicleId,
        make: vehicle.make,
        model: vehicle.model,
        quantity,
        unitPrice: vehicle.price,
        totalPrice: vehicle.price.mul(quantity),
      },
    });

    return { purchase: toPurchaseResponse(purchase), vehicle: toVehicleResponse(vehicle) };
  });
}

/**
 * Adds stock to a vehicle. The increment is done in SQL (`quantity = quantity + n`),
 * not as read-then-write, so concurrent restocks never overwrite each other.
 */
export async function restockVehicle(
  vehicleId: string,
  quantity: number,
): Promise<VehicleResponse> {
  const vehicle = await orNotFound(
    () =>
      prisma.vehicle.update({
        where: { id: vehicleId },
        data: { quantity: { increment: quantity } },
      }),
    'Vehicle not found',
  );
  return toVehicleResponse(vehicle);
}

/** A user's purchase history, newest first. Prices are the ones paid, not current prices. */
export async function listPurchasesForUser(userId: string): Promise<PurchaseResponse[]> {
  const purchases = await prisma.purchase.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
  });
  return purchases.map(toPurchaseResponse);
}
