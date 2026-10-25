import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { requireAuth } from '../../src/middleware/requireAuth';
import { requireRole } from '../../src/middleware/requireRole';
import { errorHandler } from '../../src/middleware/errorHandler';
import { bearerFor } from '../helpers/auth';
import { resetDatabase } from '../helpers/db';
import { createUser } from '../helpers/factories';

/** A minimal app with one admin-only route, to test the guards in isolation. */
function buildApp() {
  const app = express();
  app.get('/admin-only', requireAuth, requireRole('ADMIN'), (_req, res) => {
    res.json({ ok: true });
  });
  app.use(errorHandler);
  return app;
}

describe('requireRole("ADMIN")', () => {
  const app = buildApp();
  beforeEach(resetDatabase);

  it('lets an admin through', async () => {
    const admin = await createUser({ role: 'ADMIN' });

    const res = await request(app).get('/admin-only').set('Authorization', bearerFor(admin));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('returns 403 FORBIDDEN for a regular user', async () => {
    const user = await createUser({ role: 'USER' });

    const res = await request(app).get('/admin-only').set('Authorization', bearerFor(user));

    expect(res.status).toBe(403);
    expect(res.body.error).toEqual({
      code: 'FORBIDDEN',
      message: 'You do not have permission to perform this action',
    });
  });

  it('returns 401 when no token is sent', async () => {
    const res = await request(app).get('/admin-only');

    expect(res.status).toBe(401);
  });

  it('uses the role stored in the database, not the role claimed in the token', async () => {
    const demotedUser = await createUser({ role: 'USER' });
    const staleAdminToken = jwt.sign({ role: 'ADMIN' }, process.env.JWT_SECRET as string, {
      subject: demotedUser.id,
    });

    const res = await request(app)
      .get('/admin-only')
      .set('Authorization', `Bearer ${staleAdminToken}`);

    expect(res.status).toBe(403);
  });
});
