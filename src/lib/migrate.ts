import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), 'data.db')}`;
const client = createClient({ url: dbPath });

async function migrate() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'activo',
      deadline TEXT NOT NULL DEFAULT '',
      repo_id TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '#0075de',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS repos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      language TEXT NOT NULL DEFAULT 'TypeScript',
      status TEXT NOT NULL DEFAULT 'activo',
      url TEXT NOT NULL DEFAULT '',
      last_updated TEXT NOT NULL DEFAULT (datetime('now')),
      stars INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pendiente',
      priority TEXT NOT NULL DEFAULT 'media',
      project_id TEXT NOT NULL DEFAULT '',
      due_date TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      project_id TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      duration INTEGER NOT NULL DEFAULT 60,
      type TEXT NOT NULL DEFAULT 'desarrollo',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      value REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      start_date TEXT NOT NULL DEFAULT '',
      end_date TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pendiente',
      pdf_url TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed admin si no hay ningún usuario
  const existing = await client.execute('SELECT COUNT(*) as count FROM users');
  const count = (existing.rows[0] as unknown as { count: number }).count;
  if (count === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    await client.execute({
      sql: `INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, 'admin')`,
      args: [id, 'admin', hash],
    });
    console.log('✓ Usuario admin creado (contraseña: admin123) — cámbiala después del primer login');
  }

  console.log('✓ Tablas creadas correctamente');
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
