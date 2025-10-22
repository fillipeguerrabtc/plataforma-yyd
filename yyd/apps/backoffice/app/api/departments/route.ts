import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    requirePermission(req, 'departments', 'view');
    
    const departments = await prisma.department.findMany({
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

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requirePermission(req, 'departments', 'create');
    
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const department = await prisma.department.create({
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

    console.log(`✅ Created department: ${body.name}`);

    return NextResponse.json(department);
  } catch (error: any) {
    console.error('Error creating department:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um departamento com este nome' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: error.message || 'Falha ao criar departamento' }, { status: 500 });
  }
}
