import { parseEnv } from '../../src/config/env';

const valid = {
  DATABASE_URL: 'postgresql://localhost/db',
  JWT_SECRET: 'x'.repeat(32),
};

describe('parseEnv', () => {
  it('applies defaults for optional settings', () => {
    expect(parseEnv(valid)).toMatchObject({
      NODE_ENV: 'development',
      PORT: 4000,
      JWT_EXPIRES_IN: '1d',
      CORS_ORIGIN: 'http://localhost:5173',
    });
  });

  it('fails fast with a readable list of every problem', () => {
    const parse = () => parseEnv({ JWT_SECRET: 'too-short', PORT: 'abc' });

    expect(parse).toThrow(/^Invalid environment configuration:/);
    expect(parse).toThrow(/- DATABASE_URL: /);
    expect(parse).toThrow(/- JWT_SECRET: JWT_SECRET must be at least 32 characters/);
    expect(parse).toThrow(/- PORT: /);
  });

  it.each(['15m', '1d', '3600s', '12h'])('accepts JWT_EXPIRES_IN "%s" with a unit', (value) => {
    expect(parseEnv({ ...valid, JWT_EXPIRES_IN: value }).JWT_EXPIRES_IN).toBe(value);
  });

  it('rejects a JWT_EXPIRES_IN without a unit, which jsonwebtoken would read as milliseconds', () => {
    expect(() => parseEnv({ ...valid, JWT_EXPIRES_IN: '3600' })).toThrow(/JWT_EXPIRES_IN/);
  });
});
