import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'finance', 'update');
    const body = await request.json();

    const before = await prisma.payroll.findUnique({
      where: { id: params.id },
    });

    if (!before) {
      return NextResponse.json({ error: 'Payroll not found' }, { status: 404 });
    }

    const { status, paidAt, paymentMethod, notes } = body;

    const updated = await prisma.payroll.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(paidAt && { paidAt: new Date(paidAt) }),
        ...(paymentMethod && { paymentMethod }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date(),
      },
    });

    await logCRUD(user.userId, user.email, 'update', 'payroll', updated.id, { before, after: updated }, request);

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'finance', 'delete');

    const before = await prisma.payroll.findUnique({
      where: { id: params.id },
    });

    if (!before) {
      return NextResponse.json({ error: 'Payroll not found' }, { status: 404 });
    }

    await prisma.payroll.delete({
      where: { id: params.id },
    });

    await logCRUD(user.userId, user.email, 'delete', 'payroll', params.id, { before }, request);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
