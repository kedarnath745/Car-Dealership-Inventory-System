import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { resetDatabase } from '../helpers/db';

const app = createApp();
const validUser = { name: 'Asha Rao', email: 'asha@example.com', password: 'secret123' };

describe('POST /api/auth/register', () => {
  beforeEach(resetDatabase);

  it('creates a user and returns 201 with a token and the public user fields', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({
      id: expect.any(String),
      name: 'Asha Rao',
      email: 'asha@example.com',
      role: 'USER',
    });
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('issues a JWT whose subject is the new user id and carries the role', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    expect(payload.sub).toBe(res.body.user.id);
    expect(payload.role).toBe('USER');
  });

  it('stores a bcrypt hash, never the plain password', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const stored = await prisma.user.findUniqueOrThrow({ where: { email: validUser.email } });
    expect(stored.passwordHash).not.toBe(validUser.password);
    await expect(bcrypt.compare(validUser.password, stored.passwordHash)).resolves.toBe(true);
  });

  it('normalises the email to trimmed lowercase', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: '  Asha@Example.COM ' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('asha@example.com');
  });

  it('ignores a role in the request body so users cannot make themselves admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, role: 'ADMIN' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('USER');
  });

  it('rejects an email that is already registered, ignoring case, with 409', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'ASHA@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.error).toEqual({
      code: 'EMAIL_TAKEN',
      message: 'An account with this email already exists',
    });
  });

  it.each([
    ['name is missing', { email: 'a@example.com', password: 'secret123' }, 'name'],
    ['name is too short', { ...validUser, name: 'A' }, 'name'],
    ['email is invalid', { ...validUser, email: 'not-an-email' }, 'email'],
    ['password is shorter than 8 characters', { ...validUser, password: 'short' }, 'password'],
    ['password exceeds 72 characters', { ...validUser, password: 'x'.repeat(73) }, 'password'],
  ])('returns 400 with field details when %s', async (_case, body, field) => {
    const res = await request(app).post('/api/auth/register').send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field })]),
    );
  });

  it('returns 400 for a malformed JSON body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send('{"name": "broken"');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });
});
