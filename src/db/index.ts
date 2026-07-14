import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const queryClient = postgres(process.env.DATABASE_URL || 'postgres://postgres:geheim@localhost:5432/pk_db');
export const db = drizzle(queryClient, { schema });