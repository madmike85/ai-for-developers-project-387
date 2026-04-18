import { PrismaClient } from '@prisma/client';

// Export Prisma client
export const prisma = new PrismaClient();

// Export types
export * from '@prisma/client';
