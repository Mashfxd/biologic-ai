const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const operatorPassword = await bcrypt.hash('operador123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
    },
    create: {
      username: 'admin',
      email: 'admin@biologic.ai',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { username: 'operador' },
    update: {
      password: operatorPassword,
      role: 'OPERATOR',
    },
    create: {
      username: 'operador',
      email: 'operador@biologic.ai',
      password: operatorPassword,
      role: 'OPERATOR',
    },
  });

  console.log('Usuarios de prueba creados/actualizados correctamente:');
  console.log('  1. Administrador -> usuario: admin    | contraseña: admin123');
  console.log('  2. Operador      -> usuario: operador | contraseña: operador123');
}

main()
  .catch((error) => {
    console.error('Error ejecutando seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
