import { PrismaClient } from '@prisma/client';

/** Shared Prisma client: one connection pool for the whole process. */
export const prisma = new PrismaClient();
