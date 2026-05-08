import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.DATABASE_URL) {
  const globalForPrisma = global;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
} else {
  console.warn("DATABASE_URL is not set. Using fallback handlers.");
  
  const handleDBError = async () => {
    // Para simplificar la demo si no hay base de datos configurada, devolvemos arrays vacios.
    return [];
  };

  prisma = {
    animal: { findMany: handleDBError, create: handleDBError, findUnique: handleDBError },
    user: { findUnique: handleDBError },
    healthLog: { findMany: handleDBError, create: handleDBError },
    growthLog: { findMany: handleDBError, create: handleDBError },
    feedingLog: { findMany: handleDBError, create: handleDBError },
  };
}

export default prisma;
