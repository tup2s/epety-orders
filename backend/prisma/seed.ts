import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { login: 'admin' },
    update: { password: adminPassword },
    create: {
      login: 'admin',
      password: adminPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.login);

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'E-papierosy' },
      update: {},
      create: { name: 'E-papierosy', description: 'Urządzenia do wapowania' },
    }),
    prisma.category.upsert({
      where: { name: 'Olejki' },
      update: {},
      create: { name: 'Olejki', description: 'Olejki i liquidy' },
    }),
    prisma.category.upsert({
      where: { name: 'Akcesoria' },
      update: {},
      create: { name: 'Akcesoria', description: 'Części zamienne i dodatki' },
    }),
  ]);

  console.log('✅ Categories created:', categories.map(c => c.name).join(', '));

  console.log('\n🚀 Seed completed!');
  console.log('📋 Login: admin');
  console.log('🔑 Password: admin123');
  console.log('\n⚠️  Zmień hasło po pierwszym logowaniu!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
