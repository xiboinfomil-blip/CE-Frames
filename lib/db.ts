// lib/db.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';

// Next.js automatically loads .env.local, no need for manual dotenv import
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

// Fail loudly if database URL is missing (both dev and prod)
if (!connectionString) {
  const errorMsg = [
    '❌ Database URL is missing!',
    'Set one of the following environment variables:',
    '  - DATABASE_URL',
    '  - POSTGRES_URL',
    '  - POSTGRES_PRISMA_URL',
    '',
    'In development: Add to .env.local',
    'In production (Vercel): Add to Project Settings → Environment Variables',
  ].join('\n');
  
  throw new Error(errorMsg);
}

const dbInstance = drizzle(neon(connectionString), { schema });

// Pass the schema to drizzle to enable db.query API.
export const db = dbInstance as NonNullable<typeof dbInstance>;
