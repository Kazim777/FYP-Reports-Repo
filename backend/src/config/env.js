import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  BLOB_STORE_ID: z.string().optional(),
  GMAIL_USER: z.string().email().optional(),
  GMAIL_APP_PASSWORD: z
    .string()
    .transform((value) => value.replace(/\s/g, ''))
    .optional(),
  MAIL_FROM_NAME: z.string().default('FYP Hub'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Invalid backend environment configuration:\n${problems.join('\n')}`);
}

export const env = {
  isProduction: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  clientUrl: parsed.data.CLIENT_URL,
  blobStorageConfigured: Boolean(parsed.data.BLOB_READ_WRITE_TOKEN || parsed.data.BLOB_STORE_ID),
  gmail:
    parsed.data.GMAIL_USER && parsed.data.GMAIL_APP_PASSWORD
      ? {
          user: parsed.data.GMAIL_USER,
          appPassword: parsed.data.GMAIL_APP_PASSWORD,
          fromName: parsed.data.MAIL_FROM_NAME,
        }
      : null,
};
