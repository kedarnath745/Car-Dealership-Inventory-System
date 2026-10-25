import request from 'supertest';
import { createApp } from '../../src/app';
import { resetDatabase } from '../helpers/db';
import { DEFAULT_PASSWORD, createUser } from '../helpers/factories';

const badLogin = { email: 'ravi@example.com', password: 'wrong-password' };

describe('auth rate limiting (D24)', () => {
  beforeEach(async () => {
    await resetDatabase();
    await createUser({ email: 'ravi@example.com' });
  });

  it('returns 429 with Retry-After once the failed-attempt limit is reached', async () => {
    const app = createApp({ authRateLimit: { limit: 3, windowMs: 60_000 } });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const res = await request(app).post('/api/auth/login').send(badLogin);
      expect(res.status).toBe(401);
    }
    const blocked = await request(app).post('/api/auth/login').send(badLogin);

    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toEqual({
      code: 'RATE_LIMITED',
      message: 'Too many attempts. Please wait a few minutes and try again.',
    });
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('does not count successful logins towards the limit', async () => {
    const app = createApp({ authRateLimit: { limit: 2, windowMs: 60_000 } });
    const goodLogin = { email: 'ravi@example.com', password: DEFAULT_PASSWORD };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const res = await request(app).post('/api/auth/login').send(goodLogin);
      expect(res.status).toBe(200);
    }
  });

  it('also limits registration attempts', async () => {
    const app = createApp({ authRateLimit: { limit: 1, windowMs: 60_000 } });

    await request(app).post('/api/auth/register').send({});
    const blocked = await request(app).post('/api/auth/register').send({});

    expect(blocked.status).toBe(429);
  });

  it('counts successful registrations too, so accounts cannot be mass-created', async () => {
    const app = createApp({ authRateLimit: { limit: 2, windowMs: 60_000 } });
    const register = (n: number) =>
      request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bulk User',
          email: `bulk${n}@example.com`,
          password: 'a-long-passphrase-123',
        });

    expect((await register(1)).status).toBe(201);
    expect((await register(2)).status).toBe(201);
    expect((await register(3)).status).toBe(429);
  });

  it('leaves non-auth routes unaffected', async () => {
    const app = createApp({ authRateLimit: { limit: 1, windowMs: 60_000 } });

    await request(app).post('/api/auth/login').send(badLogin);
    await request(app).post('/api/auth/login').send(badLogin);
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
  });

  it('tells clients apart by X-Forwarded-For when running behind a trusted proxy', async () => {
    const app = createApp({ trustProxy: 1, authRateLimit: { limit: 1, windowMs: 60_000 } });

    const first = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', '203.0.113.1')
      .send(badLogin);
    const secondClient = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', '203.0.113.2')
      .send(badLogin);

    expect(first.status).toBe(401);
    expect(secondClient.status).toBe(401);
  });
});
