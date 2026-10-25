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
});
