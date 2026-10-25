import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { bearerFor } from '../helpers/auth';
import { resetDatabase } from '../helpers/db';
import { createUser } from '../helpers/factories';
import { createVehicle } from '../helpers/vehicles';

const app = createApp();

describe('PUT /api/vehicles/:id', () => {
  let adminAuth: string;
  let userAuth: string;

  beforeEach(async () => {
    await resetDatabase();
    adminAuth = bearerFor(await createUser({ role: 'ADMIN' }));
    userAuth = bearerFor(await createUser({ role: 'USER' }));
  });

  const put = (auth: string, id: string, body: object) =>
    request(app).put(`/api/vehicles/${id}`).set('Authorization', auth).send(body);

  it('applies a partial update and leaves other fields unchanged', async () => {
    const vehicle = await createVehicle({ model: 'Fortuner', price: 3850000, quantity: 4 });

    const res = await put(adminAuth, vehicle.id, { price: 3699000.5, color: '  Attitude Black ' });

    expect(res.status).toBe(200);
    expect(res.body.vehicle).toMatchObject({
      id: vehicle.id,
      model: 'Fortuner',
      price: 3699000.5,
      color: 'Attitude Black',
      quantity: 4,
    });
    const stored = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } });
    expect(stored.price.toString()).toBe('3699000.5');
    expect(stored.updatedAt.getTime()).toBeGreaterThan(vehicle.updatedAt.getTime());
  });

  it('clears the image when imageUrl is null', async () => {
    const vehicle = await createVehicle({ imageUrl: 'https://example.com/car.jpg' });

    const res = await put(adminAuth, vehicle.id, { imageUrl: null });

    expect(res.status).toBe(200);
    expect(res.body.vehicle.imageUrl).toBeNull();
  });

  it('rejects quantity changes: stock only moves through purchase and restock (D19)', async () => {
    const vehicle = await createVehicle({ quantity: 4 });

    const res = await put(adminAuth, vehicle.id, { quantity: 100 });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([
      {
        field: 'quantity',
        message: 'Quantity can only be changed through purchase or restock',
      },
    ]);
    const stored = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } });
    expect(stored.quantity).toBe(4);
  });

  it('returns 400 when the body has no updatable fields', async () => {
    const vehicle = await createVehicle();

    const res = await put(adminAuth, vehicle.id, {});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details[0].message).toBe('Provide at least one field to update');
  });

  it.each([
    ['price is negative', { price: -1 }, 'price'],
    ['category is not in the list', { category: 'SPACESHIP' }, 'category'],
    ['make is blank', { make: ' ' }, 'make'],
    ['imageUrl uses a javascript: scheme', { imageUrl: 'javascript:alert(1)' }, 'imageUrl'],
  ])('returns 400 when %s', async (_case, body, field) => {
    const vehicle = await createVehicle();

    const res = await put(adminAuth, vehicle.id, body);

    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field })]),
    );
  });

  it('returns 404 for a vehicle that does not exist', async () => {
    const res = await put(adminAuth, randomUUID(), { price: 100 });

    expect(res.status).toBe(404);
    expect(res.body.error).toEqual({ code: 'NOT_FOUND', message: 'Vehicle not found' });
  });

  it('returns 400 for an id that is not a UUID', async () => {
    const res = await put(adminAuth, 'abc', { price: 100 });

    expect(res.status).toBe(400);
  });

  it('returns 403 for a regular user and changes nothing', async () => {
    const vehicle = await createVehicle({ price: 500000 });

    const res = await put(userAuth, vehicle.id, { price: 1 });

    expect(res.status).toBe(403);
    const stored = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } });
    expect(stored.price.toNumber()).toBe(500000);
  });

  it('returns 401 without a token', async () => {
    const vehicle = await createVehicle();

    const res = await request(app).put(`/api/vehicles/${vehicle.id}`).send({ price: 1 });

    expect(res.status).toBe(401);
  });
});
