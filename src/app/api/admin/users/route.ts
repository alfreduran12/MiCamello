import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { requireAdmin, getSession, ok, err, generateId, now } from '@/lib/api-helpers';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const rows = await db
    .select({ id: users.id, username: users.username, role: users.role, createdAt: users.createdAt })
    .from(users)
    .orderBy(users.createdAt);
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const body = await req.json();
  if (!body.username) return err('username requerido');
  if (!body.password || body.password.length < 6) return err('contraseña mínimo 6 caracteres');

  const existing = await db.select().from(users).where(eq(users.username, body.username.trim().toLowerCase())).limit(1);
  if (existing.length > 0) return err('ese nombre de usuario ya existe');

  const passwordHash = await bcrypt.hash(body.password, 10);
  const row = {
    id: generateId(),
    username: body.username.trim().toLowerCase(),
    passwordHash,
    role: body.role === 'admin' ? 'admin' : 'user',
    createdAt: now(),
    updatedAt: now(),
  };
  await db.insert(users).values(row);
  const { passwordHash: _, ...safe } = row;
  return ok(safe);
}

export async function PUT(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const body = await req.json();
  if (!body.id) return err('id requerido');

  const session = await getSession();
  // @ts-expect-error extra field
  const currentUserId = session?.user?.id;

  const updates: Record<string, string> = { updatedAt: now() };
  if (body.role) updates.role = body.role === 'admin' ? 'admin' : 'user';
  if (body.username) updates.username = body.username.trim().toLowerCase();
  if (body.password) {
    if (body.password.length < 6) return err('contraseña mínimo 6 caracteres');
    updates.passwordHash = await bcrypt.hash(body.password, 10);
  }

  // No se puede rebajar el propio rol
  if (body.id === currentUserId && body.role === 'user') {
    return err('No puedes quitarte el rol de administrador a ti mismo');
  }

  await db.update(users).set(updates).where(eq(users.id, body.id));
  return ok({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const { id } = await req.json();
  if (!id) return err('id requerido');

  const session = await getSession();
  // @ts-expect-error extra field
  if (id === session?.user?.id) return err('No puedes eliminar tu propia cuenta');

  await db.delete(users).where(eq(users.id, id));
  return ok({ ok: true });
}
