import { Category } from '@prisma/client';
import { prisma } from '../../src/lib/prisma';
import { createVehicleSchema } from '../../src/modules/vehicles/vehicle.schemas';
import { SAMPLE_VEHICLES, seedVehicles } from '../../src/seed/seedVehicles';
import { resetDatabase } from '../helpers/db';
import { createVehicle } from '../helpers/vehicles';

describe('seedVehicles', () => {
  beforeEach(resetDatabase);

  it('inserts the sample inventory into an empty table and reports how many', async () => {
    const inserted = await seedVehicles();

    expect(inserted).toBe(SAMPLE_VEHICLES.length);
    await expect(prisma.vehicle.count()).resolves.toBe(SAMPLE_VEHICLES.length);
  });

  it('does nothing when vehicles already exist, so admin edits are never overwritten', async () => {
    await createVehicle({ model: 'Edited by admin' });

    const inserted = await seedVehicles();

    expect(inserted).toBe(0);
    await expect(prisma.vehicle.count()).resolves.toBe(1);
  });

  it('only contains vehicles the API itself would accept', () => {
    for (const vehicle of SAMPLE_VEHICLES) {
      expect(createVehicleSchema.safeParse(vehicle).success).toBe(true);
    }
  });

  it('covers every category plus sold-out and low-stock cars for the stock badges', () => {
    const categories = new Set(SAMPLE_VEHICLES.map((vehicle) => vehicle.category));

    expect([...categories].sort()).toEqual(Object.values(Category).sort());
    expect(SAMPLE_VEHICLES.some((vehicle) => vehicle.quantity === 0)).toBe(true);
    expect(SAMPLE_VEHICLES.some((vehicle) => vehicle.quantity >= 1 && vehicle.quantity <= 3)).toBe(
      true,
    );
  });
});
