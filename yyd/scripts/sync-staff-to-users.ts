import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncStaffToUsers() {
  console.log('🔄 Iniciando sincronização de Staff → Users...\n');

  try {
    const allStaff = await prisma.staff.findMany({
      where: {
        status: 'active',
      },
    });

    console.log(`📊 Encontrados ${allStaff.length} funcionários ativos\n`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const staff of allStaff) {
      if (!staff.passwordHash) {
        console.log(`⚠️  Skipping ${staff.email} - sem senha definida`);
        skipped++;
        continue;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: staff.email },
      });

      if (existingUser) {
        // Update existing user
        await prisma.user.update({
          where: { email: staff.email },
          data: {
            name: staff.name,
            passwordHash: staff.passwordHash,
            role: staff.role,
            active: staff.status === 'active',
          },
        });
        console.log(`✅ Atualizado: ${staff.email} (${staff.name})`);
        updated++;
      } else {
        // Create new user
        await prisma.user.create({
          data: {
            email: staff.email,
            name: staff.name,
            passwordHash: staff.passwordHash,
            role: staff.role,
            active: staff.status === 'active',
          },
        });
        console.log(`✨ Criado: ${staff.email} (${staff.name})`);
        created++;
      }
    }

    console.log(`\n📊 Resumo da Sincronização:`);
    console.log(`   ✨ Criados: ${created}`);
    console.log(`   ✅ Atualizados: ${updated}`);
    console.log(`   ⚠️  Ignorados: ${skipped}`);
    console.log(`\n✅ Sincronização concluída!`);

  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

syncStaffToUsers()
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
