import { SignJWT, jwtVerify } from 'jose';

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
    .setExpirationTime('8h') // La sesión dura 8 horas (ideal para un turno de trabajo)
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