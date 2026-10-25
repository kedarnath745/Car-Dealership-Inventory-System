import type { User } from '@prisma/client';
import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { bearerFor } from '../helpers/auth';
import { resetDatabase } from '../helpers/db';
import { createUser } from '../helpers/factories';
import { createVehicle } from '../helpers/vehicles';

const app = createApp();

describe('GET /api/purchases/me', () => {
  let buyer: User;

  beforeEach(async () => {
    await resetDatabase();
    buyer = await createUser();
  });

  const buy = (user: User, vehicleId: string, quantity = 1) =>
    request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', bearerFor(user))
      .send({ quantity });

  const history = (user: User) =>
    request(app).get('/api/purchases/me').set('Authorization', bearerFor(user));

  it("returns only the caller's purchases, newest first", async () => {
    const swift = await createVehicle({ model: 'Swift', quantity: 5 });
    const creta = await createVehicle({ model: 'Creta', quantity: 5 });
    await buy(buyer, swift.id);
    await buy(buyer, creta.id, 2);
    await buy(await createUser(), swift.id);

    const res = await history(buyer);

    expect(res.status).toBe(200);
    expect(
      res.body.purchases.map((p: { model: string; quantity: number }) => [p.model, p.quantity]),
    ).toEqual([
      ['Creta', 2],
      ['Swift', 1],
    ]);
  });

  it('keeps the price paid even after the vehicle price changes (D6)', async () => {
    const vehicle = await createVehicle({ price: 1000000, quantity: 5 });
    await buy(buyer, vehicle.id);
    await prisma.vehicle.update({ where: { id: vehicle.id }, data: { price: 1200000 } });

    const res = await history(buyer);

    expect(res.body.purchases[0]).toMatchObject({ unitPrice: 1000000, totalPrice: 1000000 });
  });

  it('still lists purchases of vehicles that were deleted (D7)', async () => {
    const vehicle = await createVehicle({ model: 'Discontinued', quantity: 5 });
    await buy(buyer, vehicle.id);
    await prisma.vehicle.delete({ where: { id: vehicle.id } });

    const res = await history(buyer);

    expect(res.body.purchases).toEqual([
      expect.objectContaining({ model: 'Discontinued', vehicleId: null }),
    ]);
  });

  it('returns an empty list for a user with no purchases', async () => {
    const res = await history(buyer);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ purchases: [] });
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/purchases/me');

    expect(res.status).toBe(401);
  });
});
