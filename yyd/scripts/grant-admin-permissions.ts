import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Granting all permissions to admin user...');
  
  // Find admin user
  const adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { role: 'admin' },
        { email: { contains: 'admin' } },
      ],
    },
  });

  if (!adminUser) {
    console.log('⚠️  No admin user found. Creating one...');
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@yesyoudeserve.tours',
        name: 'Administrator',
        passwordHash: '$2a$10$ZqX5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5',
        role: 'admin',
        active: true,
      },
    });
    console.log(`✅ Created admin user: ${newAdmin.email}`);
    await grantAllPermissions(newAdmin.id);
  } else {
    console.log(`👤 Found admin user: ${adminUser.email}`);
    await grantAllPermissions(adminUser.id);
  }
}

async function grantAllPermissions(userId: string) {
  // Get all permissions
  const allPermissions = await prisma.permission.findMany({
    where: { active: true },
  });

  console.log(`📋 Found ${allPermissions.length} active permissions`);

  let created = 0;
  let updated = 0;

  for (const permission of allPermissions) {
    const existing = await prisma.userPermission.findUnique({
      where: {
        userId_permissionId: {
          userId,
          permissionId: permission.id,
        },
      },
    });

    if (existing) {
      // Update to full access (read + write)
      await prisma.userPermission.update({
        where: { id: existing.id },
        data: {
          canRead: true,
          canWrite: true,
        },
      });
      updated++;
    } else {
      // Create with full access
      await prisma.userPermission.create({
        data: {
          userId,
          permissionId: permission.id,
          canRead: true,
          canWrite: true,
        },
      });
      created++;
    }
  }

  console.log(`✅ Granted permissions to admin user:`);
  console.log(`   - Created: ${created} permissions`);
  console.log(`   - Updated: ${updated} permissions`);
  console.log(`   - Total: ${allPermissions.length} permissions (ALL with READ + WRITE access)`);
  console.log('');
  console.log('🎉 Admin user now has FULL ACCESS to everything!');
}

main()
  .catch((e) => {
    console.error('❌ Error granting admin permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
