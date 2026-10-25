/**
 * Prepares the end-to-end test database: applies migrations, empties every table and seeds
 * the demo data, so each e2e run starts from the same state. Used by e2e/playwright.config.ts.
 *
 * Emptying tables is destructive, so it refuses anything other than a local database whose
 * name ends in "_e2e" (the same idea as the "_test" guard in the backend test suite).
 */
import { execSync } from 'node:child_process';

function assertIsE2eDatabase(url: string): void {
  const { hostname, pathname } = new URL(url);
  const dbName = pathname.slice(1);
  if (!dbName.endsWith('_e2e') || !['localhost', '127.0.0.1'].includes(hostname)) {
    throw new Error(
      `Refusing to prepare "${dbName}" on "${hostname}": e2e runs need a local database ending in "_e2e"`,
    );
  }
}

async function main(): Promise<void> {
  assertIsE2eDatabase(process.env.DATABASE_URL ?? '');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  // Imported after the guard, so the client never connects to a database we refused.
  const { prisma } = await import('../src/lib/prisma');
  try {
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
    `;
    const tableList = tables.map(({ tablename }) => `"public"."${tablename}"`).join(', ');
    if (tableList)
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
  } finally {
    await prisma.$disconnect();
  }

  execSync('npm run db:seed', { stdio: 'inherit' });
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
