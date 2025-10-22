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

    return NextResponse.json({ userPermissions });
  } catch (error: any) {
    console.error('❌ Error fetching user permissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, permissionId, canRead, canWrite } = body;

    if (!userId || !permissionId) {
      return NextResponse.json(
        { error: 'userId e permissionId são obrigatórios' },
        { status: 400 }
      );
    }

    const userPermission = await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
      create: {
        userId,
        permissionId,
        canRead: canRead !== undefined ? canRead : true,
        canWrite: canWrite !== undefined ? canWrite : false,
      },
      update: {
        canRead: canRead !== undefined ? canRead : true,
        canWrite: canWrite !== undefined ? canWrite : false,
      },
      include: {
        permission: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`✅ User permission set: ${userId} -> ${permissionId}`);

    return NextResponse.json({ userPermission });
  } catch (error: any) {
    console.error('❌ Error setting user permission:', error);
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
