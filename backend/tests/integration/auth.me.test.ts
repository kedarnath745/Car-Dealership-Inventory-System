import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { bearerFor } from '../helpers/auth';
import { resetDatabase } from '../helpers/db';
import { createUser } from '../helpers/factories';

const app = createApp();
const secret = process.env.JWT_SECRET as string;

describe('GET /api/auth/me (requireAuth)', () => {
  beforeEach(resetDatabase);

  it('returns the current user for a valid bearer token', async () => {
    const user = await createUser({ name: 'Meera', email: 'meera@example.com' });

    const res = await request(app).get('/api/auth/me').set('Authorization', bearerFor(user));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      user: { id: user.id, name: 'Meera', email: 'meera@example.com', role: 'USER' },
    });
  });

  it('returns 401 MISSING_TOKEN when there is no Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('MISSING_TOKEN');
  });

  it.each(['Token abc.def.ghi', 'Bearer', 'Bearer '])(
    'returns 401 MISSING_TOKEN for a malformed header "%s"',
    async (header) => {
      const res = await request(app).get('/api/auth/me').set('Authorization', header);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('MISSING_TOKEN');
    },
  );

  describe('returns 401 INVALID_TOKEN when the token', () => {
    it('is not a JWT', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer garbage');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });

    it('is signed with a different secret', async () => {
      const user = await createUser();
      const forged = jwt.sign({ role: 'ADMIN' }, 'some-other-secret-of-sufficient-length!', {
        subject: user.id,
      });

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${forged}`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });

    it('is unsigned (alg "none")', async () => {
      const user = await createUser();
      const unsigned = jwt.sign({ role: 'ADMIN' }, '', { subject: user.id, algorithm: 'none' });

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${unsigned}`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });

    it('has expired', async () => {
      const user = await createUser();
      const expired = jwt.sign({ role: 'USER' }, secret, { subject: user.id, expiresIn: -10 });

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });

    it('belongs to a user who no longer exists', async () => {
      const user = await createUser();
      const header = bearerFor(user);
      await prisma.user.delete({ where: { id: user.id } });

      const res = await request(app).get('/api/auth/me').set('Authorization', header);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });
  });
});
