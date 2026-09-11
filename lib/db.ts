// lib/db.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';

// Next.js automatically loads .env.local, no need for manual dotenv import
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;
const dbInstance = connectionString
  ? drizzle(neon(connectionString), { schema })
  : null;

if (!dbInstance && process.env.NODE_ENV === 'production') {
  throw new Error(
    'Database configuration is missing. Set DATABASE_URL in Vercel Project Settings.'
  );
}

// Pass the schema to drizzle to enable db.query API.
export const db = dbInstance as NonNullable<typeof dbInstance>;
