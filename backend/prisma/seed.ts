/**
 * Seeds the database: `npm run db:seed`.
 * Reads the admin credentials from ADMIN_EMAIL / ADMIN_PASSWORD.
 */
import { z } from 'zod';
import { prisma } from '../src/lib/prisma';
import { seedAdmin } from '../src/seed/seedAdmin';

const seedEnv = z
  .object({
    ADMIN_EMAIL: z.email('ADMIN_EMAIL must be a valid email'),
    ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD must be at least 8 characters'),
  })
  .parse(process.env);

async function main(): Promise<void> {
  await seedAdmin({ email: seedEnv.ADMIN_EMAIL, password: seedEnv.ADMIN_PASSWORD });
  console.log(`Admin account ready: ${seedEnv.ADMIN_EMAIL}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
