import { db } from '@/lib/db';
import { contacts } from '@/lib/schema';
import { requireAuth, ok, err, generateId, now } from '@/lib/api-helpers';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const rows = await db.select().from(contacts).orderBy(contacts.name);
  // tags is stored as JSON string
  return ok(rows.map(r => ({ ...r, tags: JSON.parse(r.tags || '[]') })));
}

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const body = await req.json();
  if (!body.name) return err('name requerido');
  const row = {
    ...body,
    tags: JSON.stringify(body.tags ?? []),
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
  };
  await db.insert(contacts).values(row);
  return ok({ ...row, tags: body.tags ?? [] });
}

export async function PUT(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const body = await req.json();
  const { id, ...data } = body;
  await db.update(contacts).set({
    ...data,
    tags: JSON.stringify(data.tags ?? []),
    updatedAt: now(),
  }).where(eq(contacts.id, id));
  return ok({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await req.json();
  await db.delete(contacts).where(eq(contacts.id, id));
  return ok({ ok: true });
}
