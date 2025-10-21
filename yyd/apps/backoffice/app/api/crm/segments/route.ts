import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    requirePermission(request, 'customers', 'read');

    const segments = await prisma.customerSegment.findMany({
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(segments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requirePermission(request, 'customers', 'create');
    const body = await request.json();

    const { name, description, filters, autoUpdate } = body;

    if (!name || !filters) {
      return NextResponse.json({ error: 'name and filters are required' }, { status: 400 });
    }

    const segment = await prisma.customerSegment.create({
      data: {
        name,
        description,
        filters,
        autoUpdate: autoUpdate !== false,
        active: true,
      },
    });

    await logCRUD(user.userId, user.email, 'create', 'customer_segments', segment.id, { after: segment }, request);

    return NextResponse.json(segment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
