import { verifyPassword } from '../../src/lib/password';
import { prisma } from '../../src/lib/prisma';
import { seedAdmin } from '../../src/seed/seedAdmin';
import { resetDatabase } from '../helpers/db';
import { createUser } from '../helpers/factories';

describe('seedAdmin', () => {
  beforeEach(resetDatabase);

  it('creates an ADMIN with a hashed password when none exists', async () => {
    await seedAdmin({ email: 'Boss@Dealership.com', password: 'Admin@12345' });

    const admin = await prisma.user.findUniqueOrThrow({ where: { email: 'boss@dealership.com' } });
    expect(admin.role).toBe('ADMIN');
    expect(admin.passwordHash).not.toBe('Admin@12345');
    await expect(verifyPassword('Admin@12345', admin.passwordHash)).resolves.toBe(true);
  });

  it('is idempotent: running it twice leaves a single admin', async () => {
    await seedAdmin({ email: 'boss@dealership.com', password: 'Admin@12345' });
    await seedAdmin({ email: 'boss@dealership.com', password: 'Admin@12345' });

    await expect(prisma.user.count()).resolves.toBe(1);
  });

  it('promotes an existing account to ADMIN without overwriting its password', async () => {
    await createUser({ email: 'boss@dealership.com', password: 'their-own-password' });

    await seedAdmin({ email: 'boss@dealership.com', password: 'Admin@12345' });

    const admin = await prisma.user.findUniqueOrThrow({ where: { email: 'boss@dealership.com' } });
    expect(admin.role).toBe('ADMIN');
    await expect(verifyPassword('their-own-password', admin.passwordHash)).resolves.toBe(true);
  });
});
