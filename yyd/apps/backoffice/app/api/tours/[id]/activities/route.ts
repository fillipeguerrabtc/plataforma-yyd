import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(request, 'products', 'update');

    const activities = await prisma.productActivity.findMany({
      where: { productId: params.id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(request, 'products', 'update');
    const body = await request.json();

    // Delete all existing activities
    await prisma.productActivity.deleteMany({
      where: { productId: params.id },
    });

    // Create new activities
    const created = await prisma.productActivity.createMany({
      data: body.activities.map((a: any) => ({
        productId: params.id,
        nameEn: a.nameEn,
        namePt: a.namePt,
        nameEs: a.nameEs,
        descriptionEn: a.descriptionEn,
        descriptionPt: a.descriptionPt,
        descriptionEs: a.descriptionEs,
        imageUrl: a.imageUrl,
        sortOrder: a.sortOrder,
        active: a.active,
      })),
    });

    return NextResponse.json({ success: true, created: created.count });
  } catch (error: any) {
    console.error('Activities update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
