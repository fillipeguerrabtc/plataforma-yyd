import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';
import { SegmentCreateSchema } from '@/lib/validations';

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

    const validation = SegmentCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;
    const segment = await prisma.customerSegment.create({
      data: {
        name: data.name,
        description: data.description,
        filters: data.filters,
        autoUpdate: data.autoUpdate,
        active: data.active,
      },
    });

    await logCRUD(user.userId, user.email, 'create', 'customer_segments', segment.id, { after: segment }, request);

    return NextResponse.json(segment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
