import { db } from '@/lib/db';
import { activities } from '@/lib/schema';
import { requireAuth, ok, err, generateId, now } from '@/lib/api-helpers';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const rows = await db.select().from(activities).orderBy(activities.date);
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const body = await req.json();
  if (!body.description) return err('description requerida');
  const row = { ...body, id: generateId(), createdAt: now() };
  await db.insert(activities).values(row);
  return ok(row);
}

export async function PUT(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const body = await req.json();
  const { id, ...data } = body;
  await db.update(activities).set(data).where(eq(activities.id, id));
  return ok({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await req.json();
  await db.delete(activities).where(eq(activities.id, id));
  return ok({ ok: true });
}
