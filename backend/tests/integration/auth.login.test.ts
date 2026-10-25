import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../../src/app';
import { resetDatabase } from '../helpers/db';
import { DEFAULT_PASSWORD, createUser } from '../helpers/factories';

const app = createApp();

describe('POST /api/auth/login', () => {
  beforeEach(resetDatabase);

  it('returns 200 with a token and the public user fields for valid credentials', async () => {
    const user = await createUser({ name: 'Ravi', email: 'ravi@example.com' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ravi@example.com', password: DEFAULT_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({
      id: user.id,
      name: 'Ravi',
      email: 'ravi@example.com',
      role: 'USER',
    });
    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    expect(payload.sub).toBe(user.id);
  });

  it('matches the email case-insensitively', async () => {
    await createUser({ email: 'ravi@example.com' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '  RAVI@Example.com', password: DEFAULT_PASSWORD });

    expect(res.status).toBe(200);
  });

  it('puts the ADMIN role in the token for an admin', async () => {
    await createUser({ email: 'admin@example.com', role: 'ADMIN' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: DEFAULT_PASSWORD });

    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    expect(payload.role).toBe('ADMIN');
    expect(res.body.user.role).toBe('ADMIN');
  });

  it.each([
    ['the password is wrong', 'ravi@example.com', 'wrong-password'],
    ['the email is not registered', 'nobody@example.com', DEFAULT_PASSWORD],
  ])('returns the same generic 401 when %s', async (_case, email, password) => {
    await createUser({ email: 'ravi@example.com' });

    const res = await request(app).post('/api/auth/login').send({ email, password });

    expect(res.status).toBe(401);
    expect(res.body.error).toEqual({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    });
    expect(res.body.token).toBeUndefined();
  });

  it.each([
    ['email is missing', { password: DEFAULT_PASSWORD }, 'email'],
    ['password is missing', { email: 'ravi@example.com' }, 'password'],
  ])('returns 400 when %s', async (_case, body, field) => {
    const res = await request(app).post('/api/auth/login').send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field })]),
    );
  });
});
