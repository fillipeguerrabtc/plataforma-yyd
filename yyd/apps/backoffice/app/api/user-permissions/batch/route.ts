import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, permissions } = body;

    if (!userId || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'userId e permissions (array) são obrigatórios' },
        { status: 400 }
      );
    }

    // Check if trying to assign Administrator permission to non-staff
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Get Administrator permission
    const adminPermission = await prisma.permission.findFirst({
      where: {
        resource: 'administrator',
        action: 'full_access',
      },
    });

    // Check if trying to assign admin permission
    const hasAdminPermission = permissions.some(
      (p: any) => p.permissionId === adminPermission?.id
    );

    if (hasAdminPermission) {
      // Only staff can be administrators
      if (user.role !== 'admin' && user.role !== 'staff' && user.role !== 'director' && user.role !== 'manager') {
        return NextResponse.json(
          { 
            error: 'Apenas Funcionários (Staff) podem ter permissão de Administrador. Guias e Fornecedores não podem ser Administradores.',
            code: 'ADMIN_STAFF_ONLY'
          },
          { status: 403 }
        );
      }
    }

    // Delete existing permissions
    await prisma.userPermission.deleteMany({
      where: { userId },
    });

    // Create new permissions
    const created = await prisma.userPermission.createMany({
      data: permissions.map((p: any) => ({
        userId,
        permissionId: p.permissionId,
        canRead: p.canRead !== undefined ? p.canRead : true,
        canWrite: p.canWrite !== undefined ? p.canWrite : false,
      })),
    });

    console.log(`✅ Batch permissions updated for user ${userId}: ${created.count} permissions`);

    return NextResponse.json({ 
      success: true,
      count: created.count,
    });
  } catch (error: any) {
    console.error('❌ Error setting batch permissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
