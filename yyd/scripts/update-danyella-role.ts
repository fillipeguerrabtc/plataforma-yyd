import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateDanyellaRole() {
  console.log('🔄 Atualizando role de Danyella para Director...\n');

  try {
    // Update Staff
    const staff = await prisma.staff.update({
      where: { email: 'danyella@yyd.tours' },
      data: { role: 'director' },
    });

    // Update User
    const user = await prisma.user.update({
      where: { email: 'danyella@yyd.tours' },
      data: { role: 'director' },
    });

    console.log('✅ Danyella agora é Director!');
    console.log(`   Staff ID: ${staff.id}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n🎯 Permissões de Director:');
    console.log('   - Gerenciar produtos, guias, bookings, clientes');
    console.log('   - Ver finanças e analytics');
    console.log('   - Configurar Aurora IA');
    console.log('   - Criar contas Stripe Connect');

  } catch (error) {
    console.error('❌ Erro ao atualizar role:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateDanyellaRole()
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
