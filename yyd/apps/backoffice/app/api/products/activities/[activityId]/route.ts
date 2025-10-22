import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { activityId: string } }) {
  try {
    requirePermission(req, 'products', 'update');
    
    const body = await req.json();

    const activity = await prisma.productActivity.update({
      where: { id: params.activityId },
      data: {
        nameEn: body.nameEn,
        namePt: body.namePt,
        nameEs: body.nameEs,
        descriptionEn: body.descriptionEn,
        descriptionPt: body.descriptionPt,
        descriptionEs: body.descriptionEs,
        type: body.type,
        priceEur: body.priceEur ? parseFloat(body.priceEur) : null,
        includedInAllInclusive: body.includedInAllInclusive,
        sortOrder: body.sortOrder,
        active: body.active,
      },
    });

    return NextResponse.json(activity);
  } catch (error: any) {
    console.error('Error updating activity:', error);
    return NextResponse.json({ error: error.message || 'Failed to update activity' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { activityId: string } }) {
  try {
    requirePermission(req, 'products', 'delete');
    
    await prisma.productActivity.delete({
      where: { id: params.activityId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete activity' }, { status: 500 });
  }
}
