import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

// PATCH /api/financial/ar/:id - Update receivable
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'finance', 'update');
    const body = await request.json();
    const { status, paidAt } = body;

    const data: any = {};
    if (status) data.status = status;
    if (paidAt) data.paidAt = new Date(paidAt);

    const before = await prisma.accountsReceivable.findUnique({ where: { id: params.id } });

    const accountReceivable = await prisma.accountsReceivable.update({
      where: { id: params.id },
      data,
    });

    await logCRUD(user.userId, user.email, 'update', 'finance', accountReceivable.id, { before, after: accountReceivable }, request);

    return NextResponse.json(accountReceivable);
  } catch (error: any) {
    console.error('AR PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/financial/ar/:id - Delete receivable
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'finance', 'delete');
    const before = await prisma.accountsReceivable.findUnique({ where: { id: params.id } });

    await prisma.accountsReceivable.delete({
      where: { id: params.id },
    });

    await logCRUD(user.userId, user.email, 'delete', 'finance', params.id, { before, after: null }, request);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('AR DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
