import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
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
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const department = await prisma.department.create({
      data: {
        name: body.name,
        description: body.description || null,
        color: body.color || null,
        active: body.active !== undefined ? body.active : true,
      },
    });

    console.log(`✅ Created department: ${body.name}`);

    return NextResponse.json(department);
  } catch (error: any) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: error.message || 'Failed to create department' }, { status: 500 });
  }
}
