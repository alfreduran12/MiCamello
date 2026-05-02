import { sql } from 'drizzle-orm';
import { text, integer, real, sqliteTable } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('user'), // 'admin' | 'user'
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  status: text('status').notNull().default('activo'),
  deadline: text('deadline').notNull().default(''),
  repoId: text('repo_id').notNull().default(''),
  color: text('color').notNull().default('#0075de'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const repos = sqliteTable('repos', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  language: text('language').notNull().default('TypeScript'),
  status: text('status').notNull().default('activo'),
  url: text('url').notNull().default(''),
  lastUpdated: text('last_updated').notNull().default(sql`(datetime('now'))`),
  stars: integer('stars').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  status: text('status').notNull().default('pendiente'),
  priority: text('priority').notNull().default('media'),
  projectId: text('project_id').notNull().default(''),
  dueDate: text('due_date').notNull().default(''),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  projectId: text('project_id').notNull().default(''),
  description: text('description').notNull(),
  duration: integer('duration').notNull().default(60),
  type: text('type').notNull().default('desarrollo'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const contracts = sqliteTable('contracts', {
  id: text('id').primaryKey(),
  clientName: text('client_name').notNull(),
  title: text('title').notNull().default(''),
  value: real('value').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  startDate: text('start_date').notNull().default(''),
  endDate: text('end_date').notNull().default(''),
  status: text('status').notNull().default('pendiente'),
  pdfUrl: text('pdf_url').notNull().default(''),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull().default('Sin título'),
  content: text('content').notNull().default('{}'), // TipTap JSON
  emoji: text('emoji').notNull().default(''),
  attachments: text('attachments').notNull().default('[]'), // JSON array de archivos
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  company: text('company').notNull().default(''),
  role: text('role').notNull().default(''),
  email: text('email').notNull().default(''),
  phone: text('phone').notNull().default(''),
  tags: text('tags').notNull().default('[]'), // JSON array stored as text
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});
