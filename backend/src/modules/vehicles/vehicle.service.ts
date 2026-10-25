import { notFound } from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { type VehicleResponse, toVehicleResponse } from './vehicle.dto';
import type { CreateVehicleInput } from './vehicle.schemas';

/** Newest first; id breaks ties so the order is stable between requests. */
const NEWEST_FIRST = [{ createdAt: 'desc' as const }, { id: 'asc' as const }];

export async function createVehicle(input: CreateVehicleInput): Promise<VehicleResponse> {
  const vehicle = await prisma.vehicle.create({
    data: { ...input, imageUrl: input.imageUrl ?? null },
  });
  return toVehicleResponse(vehicle);
}

/** Every vehicle, including out-of-stock ones (decision D3). */
export async function listVehicles(): Promise<VehicleResponse[]> {
  const vehicles = await prisma.vehicle.findMany({ orderBy: NEWEST_FIRST });
  return vehicles.map(toVehicleResponse);
}

export async function getVehicle(id: string): Promise<VehicleResponse> {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    throw notFound('Vehicle not found');
  }
  return toVehicleResponse(vehicle);
}
