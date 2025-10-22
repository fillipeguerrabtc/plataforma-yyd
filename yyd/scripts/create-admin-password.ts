import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminPassword() {
  const adminEmail = 'admin@yyd.tours';
  const defaultPassword = 'admin123';

  console.log('🔐 Criando/atualizando senha do administrador...\n');

  try {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Update or create admin staff
    const staff = await prisma.staff.upsert({
      where: { email: adminEmail },
      create: {
        email: adminEmail,
        name: 'Administrator',
        passwordHash: hashedPassword,
        position: 'Administrator',
        department: 'Management',
        hireDate: new Date(),
        contractType: 'full-time',
        status: 'active',
        role: 'admin',
        canAccessModules: ['all'],
        accessLevel: 'admin',
      },
      update: {
        passwordHash: hashedPassword,
        status: 'active',
        role: 'admin',
      },
    });

    // Update or create admin user
    await prisma.user.upsert({
      where: { email: adminEmail },
      create: {
        email: adminEmail,
        name: 'Administrator',
        passwordHash: hashedPassword,
        role: 'admin',
        active: true,
      },
      update: {
        passwordHash: hashedPassword,
        role: 'admin',
        active: true,
      },
    });

    console.log('✅ Senha do administrador criada/atualizada com sucesso!');
    console.log(`\n📧 Email: ${adminEmail}`);
    console.log(`🔑 Senha: ${defaultPassword}`);
    console.log('\n⚠️  IMPORTANTE: Altere esta senha após o primeiro login!\n');

  } catch (error) {
    console.error('❌ Erro ao criar senha do administrador:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminPassword()
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
