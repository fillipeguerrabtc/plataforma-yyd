import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    const userPermissions = await prisma.userPermission.findMany({
      where: { userId },
      include: {
        permission: true,
      },
      orderBy: {
        permission: {
          sortOrder: 'asc',
        },
      },
    });

    // Transform to match frontend expectations
    const permissions = userPermissions.map(up => ({
      id: up.id,
      permissionId: up.permissionId,
      userId: up.userId,
      canRead: up.canRead,
      canWrite: up.canWrite,
      permission: up.permission,
    }));

    return NextResponse.json({ permissions });
  } catch (error: any) {
    console.error('❌ Error fetching user permissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, permissions } = body;

    if (!userId || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'userId e permissions (array) são obrigatórios' },
        { status: 400 }
      );
    }

    // Delete all existing user permissions first
    await prisma.userPermission.deleteMany({
      where: { userId },
    });

    // Create new permissions
    const created = await Promise.all(
      permissions.map((perm: any) =>
        prisma.userPermission.create({
          data: {
            userId,
            permissionId: perm.permissionId,
            canRead: perm.canRead || false,
            canWrite: perm.canWrite || false,
          },
          include: {
            permission: true,
          },
        })
      )
    );

    console.log(`✅ ${created.length} user permissions set for user ${userId}`);

    return NextResponse.json({ 
      success: true,
      count: created.length,
      permissions: created,
    });
  } catch (error: any) {
    console.error('❌ Error setting user permissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const permissionId = searchParams.get('permissionId');

    if (!userId || !permissionId) {
      return NextResponse.json(
        { error: 'userId e permissionId são obrigatórios' },
        { status: 400 }
      );
    }

    await prisma.userPermission.delete({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
    });

    console.log(`✅ User permission removed: ${userId} -> ${permissionId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error removing user permission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
