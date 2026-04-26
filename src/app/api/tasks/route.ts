import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { requireAuth, ok, err, generateId, now } from '@/lib/api-helpers';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const rows = await db.select().from(tasks).orderBy(tasks.createdAt);
  return ok(rows.map(r => ({ ...r, projectId: r.projectId, dueDate: r.dueDate })));
}

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const body = await req.json();
  if (!body.title) return err('title requerido');
  const row = { ...body, id: generateId(), createdAt: now(), updatedAt: now() };
  await db.insert(tasks).values(row);
  return ok(row);
}

export async function PUT(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const body = await req.json();
  const { id, ...data } = body;
  await db.update(tasks).set({ ...data, updatedAt: now() }).where(eq(tasks.id, id));
  return ok({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await req.json();
  await db.delete(tasks).where(eq(tasks.id, id));
  return ok({ ok: true });
}
