import { prisma } from '../../lib/prisma';
import { type VehicleResponse, toVehicleResponse } from './vehicle.dto';
import type { CreateVehicleInput } from './vehicle.schemas';

export async function createVehicle(input: CreateVehicleInput): Promise<VehicleResponse> {
  const vehicle = await prisma.vehicle.create({
    data: { ...input, imageUrl: input.imageUrl ?? null },
  });
  return toVehicleResponse(vehicle);
}
