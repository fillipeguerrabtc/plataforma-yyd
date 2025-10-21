import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(request, 'customers', 'read');

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        segmentMemberships: {
          include: {
            segment: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
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

    const before = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!before) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const updated = await prisma.customer.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    await logCRUD(user.userId, user.email, 'update', 'customers', updated.id, { before, after: updated }, request);

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
