import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { notes } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db.select().from(notes).orderBy(desc(notes.updatedAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const id = uid();
  const now = new Date().toISOString();

  await db.insert(notes).values({
    id,
    title: body.title ?? 'Sin título',
    content: body.content ?? '{}',
    emoji: body.emoji ?? '',
    attachments: JSON.stringify(body.attachments ?? []),
    createdAt: now,
    updatedAt: now,
  });

  const [note] = await db.select().from(notes).where(eq(notes.id, id));
  return NextResponse.json(note, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const updates: Partial<typeof notes.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  };
  if (body.title !== undefined) updates.title = body.title;
  if (body.content !== undefined) updates.content = body.content;
  if (body.emoji !== undefined) updates.emoji = body.emoji;
  if (body.attachments !== undefined) updates.attachments = JSON.stringify(body.attachments);

  await db.update(notes).set(updates).where(eq(notes.id, body.id));
  const [note] = await db.select().from(notes).where(eq(notes.id, body.id));
  return NextResponse.json(note);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await db.delete(notes).where(eq(notes.id, body.id));
  return NextResponse.json({ ok: true });
}
