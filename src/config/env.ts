import { z } from 'zod';

export const clientEnvSchema = z.object({
  VITE_API_URL: z.string().optional().or(z.string().length(0)),
  VITE_APP_URL: z.string().url("VITE_APP_URL must be a valid URL").optional().or(z.string().length(0)),
  VITE_PAYSTACK_PUBLIC_KEY: z.string().optional(),
});

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (MySQL connection string)"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  GEMINI_API_KEY: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_CURRENCY: z.string().default("GHS"),
  RESEND_API_KEY: z.string().optional(),
  VITE_APP_URL: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function validateClientEnv(): ClientEnv {
  const envObj = {
    VITE_API_URL: import.meta.env.VITE_API_URL || '',
    VITE_APP_URL: import.meta.env.VITE_APP_URL || '',
    VITE_PAYSTACK_PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  };

  const result = clientEnvSchema.safeParse(envObj);
  if (!result.success) {
    const errorDetails = JSON.stringify(result.error.format(), null, 2);
    console.warn('[CLIENT ENV] Missing environment variables:', errorDetails);
  }
  return (result.success ? result.data : envObj) as ClientEnv;
}

export function validateServerEnv(processEnv: Record<string, any>): ServerEnv {
  const serverObj = {
    DATABASE_URL: processEnv.DATABASE_URL || '',
    JWT_SECRET: processEnv.JWT_SECRET || '',
    JWT_REFRESH_SECRET: processEnv.JWT_REFRESH_SECRET || '',
    GEMINI_API_KEY: processEnv.GEMINI_API_KEY,
    PAYSTACK_SECRET_KEY: processEnv.PAYSTACK_SECRET_KEY,
    PAYSTACK_CURRENCY: processEnv.PAYSTACK_CURRENCY || "GHS",
    RESEND_API_KEY: processEnv.RESEND_API_KEY,
    VITE_APP_URL: processEnv.VITE_APP_URL || '',
  };

  const result = serverEnvSchema.safeParse(serverObj);

  if (!result.success) {
    const errorDetails = JSON.stringify(result.error.format(), null, 2);
    console.warn('[SERVER ENV] Missing or incorrect environment variables:', errorDetails);
  }
  return (result.success ? result.data : serverObj) as ServerEnv;
}

const isBrowser = typeof window !== 'undefined';
export const env = isBrowser ? validateClientEnv() : {} as any;
