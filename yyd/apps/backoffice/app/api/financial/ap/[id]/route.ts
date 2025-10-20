import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/financial/ap/:id - Update payable
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

    const accountPayable = await prisma.accountsPayable.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(accountPayable);
  } catch (error: any) {
    console.error('AP PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/financial/ap/:id - Delete payable
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.accountsPayable.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('AP DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
