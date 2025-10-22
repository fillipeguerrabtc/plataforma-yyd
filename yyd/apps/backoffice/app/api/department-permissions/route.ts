import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const departmentId = searchParams.get('departmentId');

    if (!departmentId) {
      return NextResponse.json(
        { error: 'departmentId é obrigatório' },
        { status: 400 }
      );
    }

    const departmentPermissions = await prisma.departmentPermission.findMany({
      where: { departmentId },
      include: {
        permission: true,
      },
      orderBy: {
        permission: {
          sortOrder: 'asc',
        },
      },
    });

    return NextResponse.json({ departmentPermissions });
  } catch (error: any) {
    console.error('❌ Error fetching department permissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { departmentId, permissionId, canRead, canWrite } = body;

    if (!departmentId || !permissionId) {
      return NextResponse.json(
        { error: 'departmentId e permissionId são obrigatórios' },
        { status: 400 }
      );
    }

    const departmentPermission = await prisma.departmentPermission.upsert({
      where: {
        departmentId_permissionId: {
          departmentId,
          permissionId,
        },
      },
      create: {
        departmentId,
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
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`✅ Department permission set: ${departmentId} -> ${permissionId}`);

    return NextResponse.json({ departmentPermission });
  } catch (error: any) {
    console.error('❌ Error setting department permission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const departmentId = searchParams.get('departmentId');
    const permissionId = searchParams.get('permissionId');

    if (!departmentId || !permissionId) {
      return NextResponse.json(
        { error: 'departmentId e permissionId são obrigatórios' },
        { status: 400 }
      );
    }

    await prisma.departmentPermission.delete({
      where: {
        departmentId_permissionId: {
          departmentId,
          permissionId,
        },
      },
    });

    console.log(`✅ Department permission removed: ${departmentId} -> ${permissionId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error removing department permission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
