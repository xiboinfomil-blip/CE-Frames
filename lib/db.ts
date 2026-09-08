// lib/db.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';

// Next.js automatically loads .env.local, no need for manual dotenv import
const connectionString = process.env.DATABASE_URL;
const dbInstance = connectionString
  ? drizzle(neon(connectionString), { schema })
  : null;

// Pass the schema to drizzle to enable db.query API. Database-backed routes
// require DATABASE_URL at runtime, while the build can still inspect them.
export const db = dbInstance as NonNullable<typeof dbInstance>;
