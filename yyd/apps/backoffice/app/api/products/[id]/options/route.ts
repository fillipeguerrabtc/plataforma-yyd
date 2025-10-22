import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requirePermission(req, 'products', 'update');
    
    const body = await req.json();

    const option = await prisma.productOption.create({
      data: {
        productId: params.id,
        nameEn: body.nameEn,
        namePt: body.namePt,
        nameEs: body.nameEs,
        descriptionEn: body.descriptionEn,
        descriptionPt: body.descriptionPt,
        descriptionEs: body.descriptionEs,
        sortOrder: body.sortOrder || 0,
        active: body.active !== undefined ? body.active : true,
      },
    });

    return NextResponse.json(option);
  } catch (error: any) {
    console.error('Error creating option:', error);
    return NextResponse.json({ error: error.message || 'Failed to create option' }, { status: 500 });
  }
}
