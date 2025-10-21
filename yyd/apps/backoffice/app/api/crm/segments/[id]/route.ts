import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';
import { SegmentUpdateSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(request, 'customers', 'read');

    const segment = await prisma.customerSegment.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!segment) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
    }

    return NextResponse.json(segment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'customers', 'update');
    const body = await request.json();

    const validation = SegmentUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const before = await prisma.customerSegment.findUnique({
      where: { id: params.id },
    });

    if (!before) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
    }

    const data = validation.data;
    const segment = await prisma.customerSegment.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.filters !== undefined && { filters: data.filters }),
        ...(data.autoUpdate !== undefined && { autoUpdate: data.autoUpdate }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });

    await logCRUD(user.userId, user.email, 'update', 'customer_segments', segment.id, { before, after: segment }, request);

    return NextResponse.json(segment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'customers', 'delete');

    const before = await prisma.customerSegment.findUnique({
      where: { id: params.id },
    });

    if (!before) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
    }

    await prisma.customerSegment.delete({
      where: { id: params.id },
    });

    await logCRUD(user.userId, user.email, 'delete', 'customer_segments', params.id, { before }, request);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
