import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Global retry middleware - automatically retries any query that fails due to
// Neon serverless database cold start / connection timeouts
prisma.$use(async (params, next) => {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await next(params);
    } catch (error: any) {
      lastError = error;

      // Check if this is a connection error that should be retried
      const isConnectionError =
        error.code === 'P1001' || // Can't reach database server
        error.code === 'P1002' || // Server timed out
        error.code === 'P1008' || // Operations timed out
        error.code === 'P1017' || // Server closed the connection
        error.code === 'P5010' || // Write timeout
        error.message?.includes('Connection terminated') ||
        error.message?.includes('Connection refused') ||
        error.message?.includes('Can\'t reach database server') ||
        error.message?.includes('Timed out') ||
        error.message?.includes('timeout') ||
        error.message?.includes('Connection pool');

      if (!isConnectionError || attempt === maxRetries) {
        throw error;
      }

      const delay = attempt * 2000; // 2s, 4s, 6s
      console.warn(`[PRISMA RETRY] Attempt ${attempt}/${maxRetries} failed for ${params.model}.${params.action}: ${error.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
