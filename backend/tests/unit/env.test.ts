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
    expect(() => parseEnv({ JWT_SECRET: 'too-short', PORT: 'abc' })).toThrow(
      /Invalid environment configuration:[\s\S]*DATABASE_URL[\s\S]*JWT_SECRET must be at least 32 characters[\s\S]*PORT/,
    );
  });
});
