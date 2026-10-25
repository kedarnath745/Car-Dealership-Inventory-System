import { randomUUID } from 'node:crypto';
import type { User } from '@prisma/client';
import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { bearerFor } from '../helpers/auth';
import { resetDatabase } from '../helpers/db';
import { createUser } from '../helpers/factories';
import { createVehicle } from '../helpers/vehicles';

const app = createApp();

describe('POST /api/vehicles/:id/purchase', () => {
  let buyer: User;
  let buyerAuth: string;

  beforeEach(async () => {
    await resetDatabase();
    buyer = await createUser({ role: 'USER' });
    buyerAuth = bearerFor(buyer);
  });

  const purchase = (auth: string, id: string, body?: object) => {
    const req = request(app).post(`/api/vehicles/${id}/purchase`).set('Authorization', auth);
    return body ? req.send(body) : req;
  };

  it('buys one unit by default and returns 201 with the purchase and updated vehicle', async () => {
    const vehicle = await createVehicle({
      make: 'Tata',
      model: 'Nexon EV',
      price: 1499000,
      quantity: 3,
    });

    const res = await purchase(buyerAuth, vehicle.id);

    expect(res.status).toBe(201);
    expect(res.body.vehicle).toMatchObject({ id: vehicle.id, quantity: 2 });
    expect(res.body.purchase).toEqual({
      id: expect.any(String),
      vehicleId: vehicle.id,
      make: 'Tata',
      model: 'Nexon EV',
      quantity: 1,
      unitPrice: 1499000,
      totalPrice: 1499000,
      createdAt: expect.any(String),
    });
    await expect(prisma.purchase.count({ where: { userId: buyer.id } })).resolves.toBe(1);
  });

  it('buys several units and computes an exact total', async () => {
    const vehicle = await createVehicle({ price: 1249999.99, quantity: 5 });

    const res = await purchase(buyerAuth, vehicle.id, { quantity: 3 });

    expect(res.status).toBe(201);
    expect(res.body.vehicle.quantity).toBe(2);
    expect(res.body.purchase.totalPrice).toBe(3749999.97);
    const stored = await prisma.purchase.findFirstOrThrow();
    expect(stored.totalPrice.toString()).toBe('3749999.97');
  });

  it('can buy the last units, leaving the stock at exactly zero', async () => {
    const vehicle = await createVehicle({ quantity: 2 });

    const res = await purchase(buyerAuth, vehicle.id, { quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.vehicle.quantity).toBe(0);
  });

  it('lets admins purchase too', async () => {
    const vehicle = await createVehicle({ quantity: 1 });

    const res = await purchase(bearerFor(await createUser({ role: 'ADMIN' })), vehicle.id);

    expect(res.status).toBe(201);
  });

  it('returns 409 OUT_OF_STOCK when the stock is zero, changing nothing', async () => {
    const vehicle = await createVehicle({ quantity: 0 });

    const res = await purchase(buyerAuth, vehicle.id);

    expect(res.status).toBe(409);
    expect(res.body.error).toEqual({
      code: 'OUT_OF_STOCK',
      message: 'This vehicle is out of stock',
    });
    await expect(prisma.purchase.count()).resolves.toBe(0);
  });

  it('returns 409 INSUFFICIENT_STOCK when asking for more than is left, changing nothing', async () => {
    const vehicle = await createVehicle({ quantity: 2 });

    const res = await purchase(buyerAuth, vehicle.id, { quantity: 3 });

    expect(res.status).toBe(409);
    expect(res.body.error).toEqual({
      code: 'INSUFFICIENT_STOCK',
      message: 'Only 2 left in stock',
    });
    const stored = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } });
    expect(stored.quantity).toBe(2);
    await expect(prisma.purchase.count()).resolves.toBe(0);
  });

  it('never oversells under concurrent purchases of the last unit (D5)', async () => {
    const vehicle = await createVehicle({ quantity: 1 });
    const buyers = await Promise.all(Array.from({ length: 5 }, () => createUser()));

    const responses = await Promise.all(
      buyers.map((user) => purchase(bearerFor(user), vehicle.id)),
    );

    const statuses = responses.map((res) => res.status).sort();
    expect(statuses).toEqual([201, 409, 409, 409, 409]);
    const stored = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } });
    expect(stored.quantity).toBe(0);
    await expect(prisma.purchase.count()).resolves.toBe(1);
  });

  it('keeps the purchase record, unlinked, when the vehicle is later deleted (D7)', async () => {
    const vehicle = await createVehicle({ make: 'Maruti', model: 'Swift', quantity: 2 });
    await purchase(buyerAuth, vehicle.id);

    await prisma.vehicle.delete({ where: { id: vehicle.id } });

    const stored = await prisma.purchase.findFirstOrThrow();
    expect(stored).toMatchObject({ vehicleId: null, make: 'Maruti', model: 'Swift' });
  });

  it.each([
    ['quantity is zero', { quantity: 0 }],
    ['quantity is negative', { quantity: -2 }],
    ['quantity is fractional', { quantity: 1.5 }],
    ['quantity is above the per-order limit', { quantity: 101 }],
    ['quantity is a string', { quantity: '2' }],
  ])('returns 400 when %s', async (_case, body) => {
    const vehicle = await createVehicle({ quantity: 500 });

    const res = await purchase(buyerAuth, vehicle.id, body);

    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([expect.objectContaining({ field: 'quantity' })]);
  });

  it('returns 404 for a vehicle that does not exist', async () => {
    const res = await purchase(buyerAuth, randomUUID());

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Vehicle not found');
  });

  it('returns 400 for an id that is not a UUID', async () => {
    const res = await purchase(buyerAuth, 'nope');

    expect(res.status).toBe(400);
  });

  it('returns 401 without a token', async () => {
    const vehicle = await createVehicle();

    const res = await request(app).post(`/api/vehicles/${vehicle.id}/purchase`);

    expect(res.status).toBe(401);
  });
});
