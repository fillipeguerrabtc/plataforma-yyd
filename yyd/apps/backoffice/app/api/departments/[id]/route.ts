import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(req, 'staff', 'read');
    
    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            photoUrl: true,
            status: true,
          },
        },
        guides: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photoUrl: true,
            active: true,
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(req, 'staff', 'update');
    
    const body = await req.json();

    const department = await prisma.department.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description || null,
        color: body.color || null,
        active: body.active !== undefined ? body.active : true,
      },
    });

    console.log(`✅ Updated department: ${body.name}`);

    return NextResponse.json(department);
  } catch (error: any) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: error.message || 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(req, 'staff', 'delete');
    
    await prisma.department.update({
      where: { id: params.id },
      data: { active: false },
    });

    console.log(`✅ Deactivated department: ${params.id}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete department' }, { status: 500 });
  }
}
