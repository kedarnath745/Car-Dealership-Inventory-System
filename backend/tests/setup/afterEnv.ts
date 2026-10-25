import { prisma } from '../../src/lib/prisma';

// Release the connection pool after each test file so Jest can exit cleanly.
afterAll(async () => {
  await prisma.$disconnect();
});
