import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length === 0) {
    throw new Error('La variable de entorno JWT_SECRET no está definida');
  }

  return new TextEncoder().encode(secret);
};

export async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getJwtSecretKey());
}

export async function verifyToken(token) {
  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    return verified.payload;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('zooai_session')?.value;

  if (!token) return null;

  return await verifyToken(token);
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

  if (user.role !== 'admin') {
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