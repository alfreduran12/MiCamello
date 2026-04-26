import { db } from '@/lib/db';
import { projects } from '@/lib/schema';
import { requireAuth, ok, err, generateId, now } from '@/lib/api-helpers';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const rows = await db.select().from(projects).orderBy(projects.createdAt);
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const body = await req.json();
  if (!body.name) return err('name requerido');
  const row = { ...body, id: generateId(), createdAt: now(), updatedAt: now() };
  await db.insert(projects).values(row);
  return ok(row);
}

export async function PUT(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const body = await req.json();
  if (!body.id) return err('id requerido');
  const { id, ...data } = body;
  await db.update(projects).set({ ...data, updatedAt: now() }).where(eq(projects.id, id));
  return ok({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await req.json();
  if (!id) return err('id requerido');
  await db.delete(projects).where(eq(projects.id, id));
  return ok({ ok: true });
}
