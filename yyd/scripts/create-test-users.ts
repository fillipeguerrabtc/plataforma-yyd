import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const testUsers = [
  {
    email: 'maria@yyd.tours',
    name: 'Maria Silva',
    password: 'maria123',
    role: 'support' as const,
    position: 'Atendimento ao Cliente',
    department: 'Customer Support',
  },
  {
    email: 'joao@yyd.tours',
    name: 'João Ferreira',
    password: 'joao123',
    role: 'finance' as const,
    position: 'Contador',
    department: 'Financeiro',
  },
  {
    email: 'pedro@yyd.tours',
    name: 'Pedro Costa',
    password: 'pedro123',
    role: 'guide' as const,
    position: 'Guia de Tour',
    department: 'Operações',
  },
];

async function createTestUsers() {
  console.log('🧪 Criando usuários de teste com diferentes roles...\n');

  for (const userData of testUsers) {
    try {
      // Check if user already exists
      const existingStaff = await prisma.staff.findUnique({
        where: { email: userData.email },
      });

      if (existingStaff) {
        console.log(`⚠️  ${userData.name} já existe. Pulando...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create Staff and User in transaction
      await prisma.$transaction([
        prisma.staff.create({
          data: {
            email: userData.email,
            name: userData.name,
            passwordHash: hashedPassword,
            position: userData.position,
            department: userData.department,
            role: userData.role,
            hireDate: new Date(),
            contractType: 'full-time',
            status: 'active',
            canAccessModules: ['all'],
            accessLevel: userData.role,
          },
        }),
        prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            passwordHash: hashedPassword,
            role: userData.role,
            active: true,
          },
        }),
      ]);

      console.log(`✅ ${userData.name} criado com role: ${userData.role}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Senha: ${userData.password}\n`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${userData.name}:`, error);
    }
  }

  console.log('\n🎯 Teste as permissões:');
  console.log('\n1. Maria (Support):');
  console.log('   ✅ Pode ver e editar bookings');
  console.log('   ✅ Pode gerenciar clientes');
  console.log('   ❌ NÃO pode criar contas Stripe');
  console.log('   ❌ NÃO pode ver finanças');
  
  console.log('\n2. João (Finance):');
  console.log('   ✅ Pode gerenciar todas as finanças');
  console.log('   ✅ Pode ver analytics');
  console.log('   ❌ NÃO pode editar produtos');
  console.log('   ❌ NÃO pode criar contas Stripe');
  
  console.log('\n3. Pedro (Guide):');
  console.log('   ✅ Pode ver seus próprios tours');
  console.log('   ✅ Pode ver suas reservas');
  console.log('   ❌ NÃO pode ver outros guias');
  console.log('   ❌ NÃO pode ver finanças');

  console.log('\n✨ Usuários prontos para teste!\n');
}

createTestUsers()
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
