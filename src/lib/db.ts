import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import path from 'path';

function resolveDbUrl(raw: string): string {
  // Si es una URL remota (Turso) o ya absoluta → usar tal cual
  if (!raw.startsWith('file:')) return raw;
  const filePart = raw.slice(5); // quita "file:"
  if (path.isAbsolute(filePart)) return raw; // ya es absoluta
  // Relativa → resolver desde el directorio del proyecto (no cwd)
  // En standalone, __dirname apunta dentro de .next/standalone
  const projectRoot = process.env.PROJECT_ROOT ?? process.cwd();
  return `file:${path.resolve(projectRoot, filePart)}`;
}

const rawUrl = process.env.DATABASE_URL ?? 'file:./data.db';
const dbUrl = resolveDbUrl(rawUrl);

const client = createClient({ url: dbUrl });
export const db = drizzle(client, { schema });

export type DB = typeof db;
