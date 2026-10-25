import type { Vehicle } from '@prisma/client';

/** A vehicle as sent to clients: identical to the row except the price is a plain number. */
export type VehicleResponse = Omit<Vehicle, 'price'> & { price: number };

/**
 * Prisma returns Decimal objects for money. They are converted to numbers only at
 * the API boundary; Decimal(12,2) values fit in a double without losing paise.
 */
export function toVehicleResponse(vehicle: Vehicle): VehicleResponse {
  return { ...vehicle, price: vehicle.price.toNumber() };
}
