import type { Prisma } from '@prisma/client';
import { notFound } from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { PrismaErrorCode, isPrismaError } from '../../lib/prismaErrors';
import { type VehicleResponse, toVehicleResponse } from './vehicle.dto';
import type {
  CreateVehicleInput,
  SearchVehiclesQuery,
  UpdateVehicleInput,
} from './vehicle.schemas';

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

/** Runs a write against one vehicle, turning "record not found" into a 404. */
async function withVehicleNotFound<T>(write: () => Promise<T>): Promise<T> {
  try {
    return await write();
  } catch (error) {
    if (isPrismaError(error, PrismaErrorCode.RecordNotFound)) {
      throw notFound('Vehicle not found');
    }
    throw error;
  }
}

export async function updateVehicle(
  id: string,
  { quantity: _quantity, ...details }: UpdateVehicleInput,
): Promise<VehicleResponse> {
  const vehicle = await withVehicleNotFound(() =>
    prisma.vehicle.update({ where: { id }, data: details }),
  );
  return toVehicleResponse(vehicle);
}

export async function getVehicle(id: string): Promise<VehicleResponse> {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    throw notFound('Vehicle not found');
  }
  return toVehicleResponse(vehicle);
}

/**
 * Prisma's `contains` becomes SQL `LIKE '%text%'` and does not escape the LIKE
 * wildcards itself, so a search for "%" would match everything. Escaping them
 * (and the backslash escape character) makes user input match literally.
 */
export function escapeLikePattern(text: string): string {
  return text.replace(/[\\%_]/g, '\\$&');
}

const containsText = (text: string) =>
  ({ contains: escapeLikePattern(text), mode: 'insensitive' }) as const;

/** Translates search filters into a Prisma `where` clause. Every given filter must match (AND). */
export function buildSearchWhere(filters: SearchVehiclesQuery): Prisma.VehicleWhereInput {
  const { make, model, category, minPrice, maxPrice } = filters;
  return {
    ...(make && { make: containsText(make) }),
    ...(model && { model: containsText(model) }),
    ...(category && { category }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: { gte: minPrice, lte: maxPrice },
    }),
  };
}

export async function searchVehicles(filters: SearchVehiclesQuery): Promise<VehicleResponse[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: buildSearchWhere(filters),
    orderBy: NEWEST_FIRST,
  });
  return vehicles.map(toVehicleResponse);
}
