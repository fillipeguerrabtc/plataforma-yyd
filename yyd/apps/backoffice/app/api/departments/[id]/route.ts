import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(req, 'departments', 'view');
    
    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            staff: true,
            guides: true,
          },
        },
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
      return NextResponse.json({ error: 'Departamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json({ error: 'Falha ao buscar departamento' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(req, 'departments', 'update');
    
    const body = await req.json();

    const department = await prisma.department.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description || null,
        email: body.email || null,
        color: body.color || '#1FB7C4',
        active: body.active !== undefined ? body.active : true,
      },
      include: {
        _count: {
          select: {
            staff: true,
            guides: true,
          },
        },
      },
    });

    console.log(`✅ Updated department: ${body.name}`);

    return NextResponse.json(department);
  } catch (error: any) {
    console.error('Error updating department:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um departamento com este nome' },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Departamento não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ error: error.message || 'Falha ao atualizar departamento' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(req, 'departments', 'delete');
    
    await prisma.department.update({
      where: { id: params.id },
      data: { active: false },
    });

    console.log(`✅ Deactivated department: ${params.id}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting department:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Departamento não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ error: error.message || 'Falha ao desativar departamento' }, { status: 500 });
  }
}
