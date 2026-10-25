import type { Prisma, Vehicle } from '@prisma/client';
import { prisma } from '../../src/lib/prisma';

/** A complete, valid vehicle payload as the API expects it. */
export const validVehicleInput = {
  make: 'Toyota',
  model: 'Fortuner',
  category: 'SUV',
  price: 3850000,
  quantity: 4,
  year: 2024,
  color: 'Pearl White',
  imageUrl: 'https://example.com/fortuner.jpg',
} as const;

/** Inserts a vehicle directly, bypassing the API, for test setup. */
export function createVehicle(
  overrides: Partial<Prisma.VehicleUncheckedCreateInput> = {},
): Promise<Vehicle> {
  return prisma.vehicle.create({ data: { ...validVehicleInput, ...overrides } });
}
