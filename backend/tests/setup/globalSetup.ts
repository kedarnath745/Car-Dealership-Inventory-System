import { execSync } from 'node:child_process';
import { assertIsTestDatabase, testDatabaseUrl } from './testDatabaseUrl';

/** Runs once before the whole suite: brings the test database schema up to date. */
export default function globalSetup(): void {
  assertIsTestDatabase(testDatabaseUrl);
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'ignore',
  });
}
