import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        userPermissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        departmentPermissions: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!permission) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
    }

    return NextResponse.json({ permission });
  } catch (error: any) {
    console.error('❌ Error fetching permission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const permission = await prisma.permission.update({
      where: { id },
      data: body,
    });

    console.log(`✅ Permission updated: ${permission.resource}.${permission.action}`);

    return NextResponse.json({ permission });
  } catch (error: any) {
    console.error('❌ Error updating permission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.permission.delete({
      where: { id },
    });

    console.log(`✅ Permission deleted: ${id}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting permission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
