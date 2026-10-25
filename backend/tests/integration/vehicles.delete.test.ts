import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { bearerFor } from '../helpers/auth';
import { resetDatabase } from '../helpers/db';
import { createUser } from '../helpers/factories';
import { createVehicle } from '../helpers/vehicles';

const app = createApp();

describe('DELETE /api/vehicles/:id', () => {
  let adminAuth: string;
  let userAuth: string;

  beforeEach(async () => {
    await resetDatabase();
    adminAuth = bearerFor(await createUser({ role: 'ADMIN' }));
    userAuth = bearerFor(await createUser({ role: 'USER' }));
  });

  const del = (auth: string, id: string) =>
    request(app).delete(`/api/vehicles/${id}`).set('Authorization', auth);

  it('lets an admin delete a vehicle and returns 204 with no body', async () => {
    const vehicle = await createVehicle();

    const res = await del(adminAuth, vehicle.id);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    await expect(prisma.vehicle.findUnique({ where: { id: vehicle.id } })).resolves.toBeNull();
  });

  it('returns 404 for a vehicle that does not exist', async () => {
    const res = await del(adminAuth, randomUUID());

    expect(res.status).toBe(404);
    expect(res.body.error).toEqual({ code: 'NOT_FOUND', message: 'Vehicle not found' });
  });

  it('returns 400 for an id that is not a UUID', async () => {
    const res = await del(adminAuth, '123');

    expect(res.status).toBe(400);
  });

  it('returns 403 for a regular user and keeps the vehicle', async () => {
    const vehicle = await createVehicle();

    const res = await del(userAuth, vehicle.id);

    expect(res.status).toBe(403);
    await expect(prisma.vehicle.count()).resolves.toBe(1);
  });

  it('returns 401 without a token', async () => {
    const vehicle = await createVehicle();

    const res = await request(app).delete(`/api/vehicles/${vehicle.id}`);

    expect(res.status).toBe(401);
  });
});
