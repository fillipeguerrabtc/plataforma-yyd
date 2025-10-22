import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const departments = [
  {
    name: 'Operações',
    description: 'Gestão operacional e logística dos tours',
    color: '#1FB7C4',
    email: 'operacoes@yyd.tours',
    active: true,
  },
  {
    name: 'Financeiro',
    description: 'Gestão financeira, pagamentos e contabilidade',
    color: '#E9C46A',
    email: 'financeiro@yyd.tours',
    active: true,
  },
  {
    name: 'Vendas',
    description: 'Equipe de vendas e relacionamento com clientes',
    color: '#16a34a',
    email: 'vendas@yyd.tours',
    active: true,
  },
  {
    name: 'Atendimento ao Cliente',
    description: 'Suporte e atendimento aos clientes',
    color: '#2563eb',
    email: 'atendimento@yyd.tours',
    active: true,
  },
  {
    name: 'Marketing',
    description: 'Marketing digital e comunicação',
    color: '#9333ea',
    email: 'marketing@yyd.tours',
    active: true,
  },
  {
    name: 'TI',
    description: 'Tecnologia da Informação e sistemas',
    color: '#7E3231',
    email: 'ti@yyd.tours',
    active: true,
  },
];

async function main() {
  console.log('🏛️ Seeding departments...');

  for (const dept of departments) {
    const existing = await prisma.department.findUnique({
      where: { name: dept.name },
    });

    if (existing) {
      console.log(`  ⏭️  Department "${dept.name}" already exists, skipping...`);
      continue;
    }

    const created = await prisma.department.create({
      data: dept,
    });

    console.log(`  ✅ Created department: ${created.name}`);
  }

  console.log('\n✅ Departments seeded successfully!');
  
  // Show all departments
  const allDepts = await prisma.department.findMany({
    include: {
      _count: {
        select: {
          staff: true,
          guides: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  console.log('\n📊 All departments:');
  allDepts.forEach((dept) => {
    console.log(`  - ${dept.name} (${dept._count.staff} staff, ${dept._count.guides} guides)`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding departments:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
