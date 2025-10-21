import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    
    const vendor = await prisma.vendor.update({
      where: { id: params.id },
      data: {
        name: body.name,
        companyName: body.companyName || null,
        email: body.email,
        phone: body.phone || null,
        address: body.address || null,
        taxId: body.taxId || null,
        category: body.category,
        bankAccount: body.bankAccount || null,
        paymentTerms: body.paymentTerms || null,
        notes: body.notes || null,
        status: body.status,
        currency: body.currency,
      },
    });

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.vendor.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
  }
}
