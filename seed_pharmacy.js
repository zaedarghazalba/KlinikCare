const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('pharmachy123', 12);
  
  await prisma.user.upsert({
    where: { email: 'apoteker@gmail.com' },
    update: {
      password: hashedPassword,
      role: 'PHARMACY'
    },
    create: {
      name: 'Apt. Sari Melati, S.Farm',
      email: 'apoteker@gmail.com',
      password: hashedPassword,
      role: 'PHARMACY'
    }
  });

  console.log("Pharmacy account created! Email: apoteker@gmail.com | Password: pharmachy123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
