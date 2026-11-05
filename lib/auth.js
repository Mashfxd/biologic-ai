import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('biologic_session')?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!Number.isSafeInteger(payload?.id) || payload.id <= 0) return null;
  return prisma.user.findUnique({ where: { id: payload.id },
    select: { id: true, username: true, role: true } });
}

export async function requireAuth() {
  const user = await getSessionUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}

export async function requireAdmin() {
  const { user, response } = await requireAuth();

  if (response) {
    return { user: null, response };
  }

  if (user.role !== 'ADMIN') {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Acceso prohibido. Se requiere rol administrador.' },
        { status: 403 }
      ),
    };
  }

  return { user, response: null };
}