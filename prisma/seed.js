const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error('Define ADMIN_USERNAME, ADMIN_EMAIL y ADMIN_PASSWORD (minimo 12 caracteres).');
  }
  await prisma.user.upsert({ where: { username: ADMIN_USERNAME }, update: {},
    create: { username: ADMIN_USERNAME, email: ADMIN_EMAIL,
      password: await bcrypt.hash(ADMIN_PASSWORD, 12), role: 'ADMIN' } });
  console.log('Administrador preparado. Las cuentas existentes no se modifican.');
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
