/**
 * Seeds the database: `npm run db:seed`.
 * Reads the admin credentials from ADMIN_EMAIL / ADMIN_PASSWORD.
 */
import { z } from 'zod';
import { MIN_PASSWORD_LENGTH } from '../src/modules/auth/auth.schemas';
import { prisma } from '../src/lib/prisma';
import { seedAdmin } from '../src/seed/seedAdmin';
import { seedVehicles } from '../src/seed/seedVehicles';

const seedEnv = z
  .object({
    ADMIN_EMAIL: z.email('ADMIN_EMAIL must be a valid email'),
    ADMIN_PASSWORD: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH,
        `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`,
      ),
  })
  .parse(process.env);

async function main(): Promise<void> {
  await seedAdmin({ email: seedEnv.ADMIN_EMAIL, password: seedEnv.ADMIN_PASSWORD });
  console.log(`Admin account ready: ${seedEnv.ADMIN_EMAIL}`);

  const inserted = await seedVehicles();
  console.log(
    inserted > 0
      ? `Inserted ${inserted} sample vehicles`
      : 'Vehicles already exist; sample inventory skipped',
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
