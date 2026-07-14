import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // KEIN Fallback-String! Nur die Variable.
    url: process.env.DATABASE_URL!, 
  },
});