/**
 * Runs before every test file. Points the app at the dedicated test database
 * and provides deterministic secrets, so tests never depend on a developer's .env.
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://dealership:dealership@localhost:5432/dealership_test';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-for-hs256';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CORS_ORIGIN = 'http://localhost:5173';
