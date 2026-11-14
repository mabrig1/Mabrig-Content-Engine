import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Uses the JS driver adapter instead of the native Rust engine. The DATABASE_URL
// must point to a real PostgreSQL database (Hyperdrive is recommended in Workers).
// Worker releases are gated on credentials and authenticated smoke tests.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
