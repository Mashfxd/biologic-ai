import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// globalThis es el estándar moderno recomendado para Next.js
const globalForPrisma = globalThis;

// Si ya existe una conexión, la recicla. Si no, crea una nueva.
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

// En desarrollo, guardamos la instancia para evitar el error de "Too many connections"
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;