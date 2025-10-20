import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/financial/ar/:id - Update receivable
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, paidAt } = body;

    const data: any = {};
    if (status) data.status = status;
    if (paidAt) data.paidAt = new Date(paidAt);

    const accountReceivable = await prisma.accountsReceivable.update({
      where: { id: params.id },
      data,
    });

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
    await prisma.accountsReceivable.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('AR DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
