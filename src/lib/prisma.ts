import { PrismaClient, Prisma } from '@prisma/client';

// Security: This file must never be imported by client-side code.
// It accesses process.env.DATABASE_URL which must not leak to the browser.
if (typeof window !== 'undefined') {
  throw new Error('[SECURITY] prisma.ts is server-only and must not be imported in client code.');
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Check if this is a connection error that should be retried
function isConnectionError(error: any): boolean {
  return (
    error?.code === 'P1001' || // Can't reach database server
    error?.code === 'P1002' || // Server timed out
    error?.code === 'P1008' || // Operations timed out
    error?.code === 'P1017' || // Server closed the connection
    error?.code === 'P5010' || // Write timeout
    error?.message?.includes('Connection terminated') ||
    error?.message?.includes('Connection refused') ||
    error?.message?.includes("Can't reach database server") ||
    error?.message?.includes('Timed out') ||
    error?.message?.includes('timeout') ||
    error?.message?.includes('Connection pool') ||
    error?.message?.includes('connect ECONNREFUSED') ||
    error?.message?.includes('database connection')
  );
}

// Global retry wrapper - automatically retries any query that fails due to
// database connection timeouts
async function withRetry<T>(operation: () => Promise<T>, context: string): Promise<T> {
  const maxRetries = 5;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      if (!isConnectionError(error) || attempt === maxRetries) {
        throw error;
      }

      const delay = attempt * 2000; // 2s, 4s, 6s, 8s, 10s
      console.warn(`[PRISMA RETRY] Attempt ${attempt}/${maxRetries} failed for ${context}: ${error.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Use $extends (Prisma 6.x compatible) to wrap all queries with retry logic
const prisma = basePrisma.$extends({
  query: {
    $allOperations({ model, operation, args, query }) {
      return withRetry(() => query(args), `${model}.${operation}`);
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;

export default prisma;
