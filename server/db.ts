// server/db.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http'; // ✅ HTTP statt WebSocket
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be gesetzt.");
}

// Direktes HTTP SQL-Interface
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
