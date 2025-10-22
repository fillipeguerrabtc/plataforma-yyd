import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createGuideUser() {
  console.log('🔐 Criando usuário para Pedro Costa (Guide)...\n');

  const password = 'pedro123';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if guide Pedro exists
    const guide = await prisma.guide.findUnique({
      where: { email: 'pedro@yyd.tours' },
    });

    if (!guide) {
      console.log('⚠️  Guide Pedro não encontrado. Criando...');
      // Create guide
      const newGuide = await prisma.guide.create({
        data: {
          email: 'pedro@yyd.tours',
          name: 'Pedro Costa',
          phone: '+351912345678',
          languages: ['PT', 'EN'],
          active: true,
        },
      });
      console.log(`✅ Guide Pedro criado: ${newGuide.id}`);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'pedro@yyd.tours' },
    });

    if (existingUser) {
      // Update password
      await prisma.user.update({
        where: { email: 'pedro@yyd.tours' },
        data: {
          passwordHash: hashedPassword,
          role: 'guide',
          active: true,
        },
      });
      console.log('✅ Usuário Pedro atualizado para role: guide');
    } else {
      // Create user
      await prisma.user.create({
        data: {
          email: 'pedro@yyd.tours',
          name: 'Pedro Costa',
          passwordHash: hashedPassword,
          role: 'guide',
          active: true,
        },
      });
      console.log('✅ Usuário Pedro criado com role: guide');
    }

    console.log('\n📧 Email: pedro@yyd.tours');
    console.log('🔑 Senha: pedro123');
    console.log('\n🎯 Pedro agora pode fazer login no Backoffice!');
    console.log('   ✅ Verá seus próprios tours');
    console.log('   ✅ Verá suas reservas');
    console.log('   ❌ NÃO verá outros guias');

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createGuideUser()
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
