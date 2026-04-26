import { db } from '@/lib/db';
import { contracts } from '@/lib/schema';
import { requireAuth, ok, err, generateId, now } from '@/lib/api-helpers';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const rows = await db.select().from(contracts).orderBy(contracts.createdAt);
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const body = await req.json();
  if (!body.clientName) return err('clientName requerido');
  const row = { ...body, id: generateId(), createdAt: now(), updatedAt: now() };
  await db.insert(contracts).values(row);
  return ok(row);
}

export async function PUT(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const body = await req.json();
  const { id, ...data } = body;
  await db.update(contracts).set({ ...data, updatedAt: now() }).where(eq(contracts.id, id));
  return ok({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await req.json();
  await db.delete(contracts).where(eq(contracts.id, id));
  return ok({ ok: true });
}
