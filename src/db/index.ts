import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy statt beim Modul-Laden geprüft: `next build` (z. B. im Docker-Image-Build)
// führt dieses Modul ohne Laufzeit-Env-Variablen aus, DATABASE_URL kommt bei diesem
// Projekt erst zur Container-Laufzeit über docker-compose.yml.
let cachedDb: PostgresJsDatabase<typeof schema> | null = null;

function getDb(): PostgresJsDatabase<typeof schema> {
  if (cachedDb) return cachedDb;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable must be set');
  }
  cachedDb = drizzle(postgres(databaseUrl), { schema });
  return cachedDb;
}

export const db: PostgresJsDatabase<typeof schema> = new Proxy(
  {} as PostgresJsDatabase<typeof schema>,
  {
    get(_target, prop) {
      return Reflect.get(getDb(), prop);
    },
  }
);
