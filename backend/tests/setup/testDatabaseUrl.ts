/** Connection string for the dedicated test database (overridable via TEST_DATABASE_URL). */
export const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgresql://dealership:dealership@localhost:5432/dealership_test';

/**
 * Guard against wiping a real database: the test helpers truncate every table,
 * so they refuse to run unless the database name clearly marks it as a test DB.
 */
export function assertIsTestDatabase(url: string): void {
  const dbName = new URL(url).pathname.slice(1);
  if (!dbName.includes('_test')) {
    throw new Error(`Refusing to run tests against "${dbName}": database name must contain "_test"`);
  }
}
