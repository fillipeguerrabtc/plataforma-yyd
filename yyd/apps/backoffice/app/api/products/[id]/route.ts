import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requirePermission(req, 'products', 'read');
    
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        activities: { orderBy: { sortOrder: 'asc' } },
        options: { orderBy: { sortOrder: 'asc' } },
        seasonPrices: { orderBy: { season: 'asc' } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requirePermission(req, 'products', 'update');
    
    const body = await req.json();

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        slug: body.slug,
        titleEn: body.titleEn,
        titlePt: body.titlePt,
        titleEs: body.titleEs,
        descriptionEn: body.descriptionEn,
        descriptionPt: body.descriptionPt,
        descriptionEs: body.descriptionEs,
        durationHours: body.durationHours,
        maxGroupSize: body.maxGroupSize,
        categoryEn: body.categoryEn,
        categoryPt: body.categoryPt,
        categoryEs: body.categoryEs,
        featuresEn: body.featuresEn,
        featuresPt: body.featuresPt,
        featuresEs: body.featuresEs,
        excludedEn: body.excludedEn,
        excludedPt: body.excludedPt,
        excludedEs: body.excludedEs,
        imageUrls: body.imageUrls,
        bestChoice: body.bestChoice,
        active: body.active,
        includeMonuments: body.includeMonuments,
        minActivities: body.minActivities,
        maxActivities: body.maxActivities,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requirePermission(req, 'products', 'delete');
    
    await prisma.product.update({
      where: { id: params.id },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
