import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { requireAuth, getSession, ok, err, now } from '@/lib/api-helpers';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const session = await getSession();
  // @ts-expect-error extra field
  const userId = session?.user?.id;
  if (!userId) return err('Sesión inválida');

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) return err('Faltan campos');
  if (newPassword.length < 6) return err('contraseña mínimo 6 caracteres');

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return err('Usuario no encontrado');

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return err('Contraseña actual incorrecta');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ passwordHash, updatedAt: now() }).where(eq(users.id, userId));
  return ok({ ok: true });
}
