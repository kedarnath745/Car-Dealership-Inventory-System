import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../../src/app';
import { bearerFor } from '../helpers/auth';
import { resetDatabase } from '../helpers/db';
import { createUser } from '../helpers/factories';
import { createVehicle } from '../helpers/vehicles';

const app = createApp();

describe('reading vehicles', () => {
  let userAuth: string;

  beforeEach(async () => {
    await resetDatabase();
    userAuth = bearerFor(await createUser({ role: 'USER' }));
  });

  describe('GET /api/vehicles', () => {
    it('returns every vehicle, newest first, including out-of-stock ones', async () => {
      await createVehicle({ model: 'Old', createdAt: new Date('2026-01-01') });
      await createVehicle({ model: 'Sold Out', quantity: 0, createdAt: new Date('2026-02-01') });
      await createVehicle({ model: 'Newest', createdAt: new Date('2026-03-01') });

      const res = await request(app).get('/api/vehicles').set('Authorization', userAuth);

      expect(res.status).toBe(200);
      expect(res.body.vehicles.map((v: { model: string }) => v.model)).toEqual([
        'Newest',
        'Sold Out',
        'Old',
      ]);
    });

    it('returns prices as numbers', async () => {
      await createVehicle({ price: 845000.5 });

      const res = await request(app).get('/api/vehicles').set('Authorization', userAuth);

      expect(res.body.vehicles[0].price).toBe(845000.5);
    });

    it('returns an empty list when there are no vehicles', async () => {
      const res = await request(app).get('/api/vehicles').set('Authorization', userAuth);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ vehicles: [] });
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/vehicles');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/vehicles/:id', () => {
    it('returns the vehicle', async () => {
      const vehicle = await createVehicle({ model: 'Creta' });

      const res = await request(app)
        .get(`/api/vehicles/${vehicle.id}`)
        .set('Authorization', userAuth);

      expect(res.status).toBe(200);
      expect(res.body.vehicle).toMatchObject({ id: vehicle.id, model: 'Creta' });
    });

    it('returns 404 for an id that does not exist', async () => {
      const res = await request(app)
        .get(`/api/vehicles/${randomUUID()}`)
        .set('Authorization', userAuth);

      expect(res.status).toBe(404);
      expect(res.body.error).toEqual({ code: 'NOT_FOUND', message: 'Vehicle not found' });
    });

    it('returns 400 for an id that is not a UUID', async () => {
      const res = await request(app).get('/api/vehicles/not-a-uuid').set('Authorization', userAuth);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toEqual([
        expect.objectContaining({ field: 'id', message: 'Invalid vehicle id' }),
      ]);
    });
  });
});
