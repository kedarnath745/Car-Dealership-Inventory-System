import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { bearerFor } from '../helpers/auth';
import { resetDatabase } from '../helpers/db';
import { createUser } from '../helpers/factories';
import { createVehicle } from '../helpers/vehicles';

const app = createApp();

describe('POST /api/vehicles/:id/restock', () => {
  let adminAuth: string;
  let userAuth: string;

  beforeEach(async () => {
    await resetDatabase();
    adminAuth = bearerFor(await createUser({ role: 'ADMIN' }));
    userAuth = bearerFor(await createUser({ role: 'USER' }));
  });

  const restock = (auth: string, id: string, body: object) =>
    request(app).post(`/api/vehicles/${id}/restock`).set('Authorization', auth).send(body);

  it('lets an admin add stock and returns 200 with the updated vehicle', async () => {
    const vehicle = await createVehicle({ quantity: 3 });

    const res = await restock(adminAuth, vehicle.id, { quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.vehicle).toMatchObject({ id: vehicle.id, quantity: 8 });
  });

  it('makes a sold-out vehicle purchasable again', async () => {
    const vehicle = await createVehicle({ quantity: 0 });

    await restock(adminAuth, vehicle.id, { quantity: 1 });
    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set('Authorization', userAuth);

    expect(res.status).toBe(201);
  });

  it('applies concurrent restocks atomically without losing any', async () => {
    const vehicle = await createVehicle({ quantity: 0 });

    await Promise.all(
      Array.from({ length: 5 }, () => restock(adminAuth, vehicle.id, { quantity: 2 })),
    );

    const stored = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } });
    expect(stored.quantity).toBe(10);
  });

  it.each([
    ['quantity is missing', {}],
    ['quantity is zero', { quantity: 0 }],
    ['quantity is negative', { quantity: -5 }],
    ['quantity is fractional', { quantity: 2.5 }],
    ['quantity is above the limit', { quantity: 10_001 }],
  ])('returns 400 when %s', async (_case, body) => {
    const vehicle = await createVehicle({ quantity: 3 });

    const res = await restock(adminAuth, vehicle.id, body);

    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([expect.objectContaining({ field: 'quantity' })]);
  });

  it('returns 403 for a regular user and leaves the stock alone', async () => {
    const vehicle = await createVehicle({ quantity: 3 });

    const res = await restock(userAuth, vehicle.id, { quantity: 5 });

    expect(res.status).toBe(403);
    const stored = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } });
    expect(stored.quantity).toBe(3);
  });

  it('returns 404 for a vehicle that does not exist', async () => {
    const res = await restock(adminAuth, randomUUID(), { quantity: 1 });

    expect(res.status).toBe(404);
  });

  it('returns 401 without a token', async () => {
    const vehicle = await createVehicle();

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .send({ quantity: 1 });

    expect(res.status).toBe(401);
  });
});
