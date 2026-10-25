import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { bearerFor } from '../helpers/auth';
import { resetDatabase } from '../helpers/db';
import { createUser } from '../helpers/factories';
import { validVehicleInput } from '../helpers/vehicles';

const app = createApp();

describe('POST /api/vehicles', () => {
  let adminAuth: string;
  let userAuth: string;

  beforeEach(async () => {
    await resetDatabase();
    adminAuth = bearerFor(await createUser({ role: 'ADMIN' }));
    userAuth = bearerFor(await createUser({ role: 'USER' }));
  });

  const post = (auth: string, body: object) =>
    request(app).post('/api/vehicles').set('Authorization', auth).send(body);

  it('lets an admin create a vehicle and returns 201 with it', async () => {
    const res = await post(adminAuth, validVehicleInput);

    expect(res.status).toBe(201);
    expect(res.body.vehicle).toEqual({
      id: expect.any(String),
      ...validVehicleInput,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    await expect(prisma.vehicle.count()).resolves.toBe(1);
  });

  it('returns the price as a JSON number and keeps paise exact', async () => {
    const res = await post(adminAuth, { ...validVehicleInput, price: 1249999.99 });

    expect(res.body.vehicle.price).toBe(1249999.99);
    const stored = await prisma.vehicle.findUniqueOrThrow({ where: { id: res.body.vehicle.id } });
    expect(stored.price.toString()).toBe('1249999.99');
  });

  it('trims text fields and treats a missing imageUrl as null', async () => {
    const { imageUrl: _omit, ...withoutImage } = validVehicleInput;

    const res = await post(adminAuth, { ...withoutImage, make: '  Tata ', model: ' Nexon EV  ' });

    expect(res.status).toBe(201);
    expect(res.body.vehicle).toMatchObject({ make: 'Tata', model: 'Nexon EV', imageUrl: null });
  });

  it('returns 403 for a regular user', async () => {
    const res = await post(userAuth, validVehicleInput);

    expect(res.status).toBe(403);
    await expect(prisma.vehicle.count()).resolves.toBe(0);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/vehicles').send(validVehicleInput);

    expect(res.status).toBe(401);
  });

  it.each([
    ['make is missing', { make: undefined }, 'make'],
    ['model is blank', { model: '   ' }, 'model'],
    ['category is not in the list', { category: 'SPACESHIP' }, 'category'],
    ['price is zero', { price: 0 }, 'price'],
    ['price is negative', { price: -5 }, 'price'],
    ['price has more than 2 decimals', { price: 100.123 }, 'price'],
    ['price is a string', { price: '500000' }, 'price'],
    ['price exceeds the column limit', { price: 10_000_000_000 }, 'price'],
    ['quantity is negative', { quantity: -1 }, 'quantity'],
    ['quantity is fractional', { quantity: 1.5 }, 'quantity'],
    ['year is before the first car', { year: 1885 }, 'year'],
    ['year is too far in the future', { year: new Date().getFullYear() + 2 }, 'year'],
    ['color is missing', { color: undefined }, 'color'],
    ['imageUrl is not a URL', { imageUrl: 'not a url' }, 'imageUrl'],
    ['imageUrl uses a javascript: scheme', { imageUrl: 'javascript:alert(1)' }, 'imageUrl'],
  ])('returns 400 when %s', async (_case, override, field) => {
    const res = await post(adminAuth, { ...validVehicleInput, ...override });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field })]),
    );
  });
});
