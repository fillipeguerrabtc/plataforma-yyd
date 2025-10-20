import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        seasonPrices: { orderBy: { minPeople: 'asc' } },
        activities: { orderBy: { id: 'asc' } },
        options: { orderBy: { id: 'asc' } },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      titleEn,
      titlePt,
      titleEs,
      descriptionEn,
      descriptionPt,
      descriptionEs,
      categoryEn,
      categoryPt,
      categoryEs,
      durationHours,
      maxGroupSize,
      imageUrls,
      active,
    } = body;

    const product = await prisma.product.create({
      data: {
        slug,
        titleEn,
        titlePt,
        titleEs,
        descriptionEn,
        descriptionPt,
        descriptionEs,
        categoryEn: categoryEn || 'Tour',
        categoryPt: categoryPt || 'Tour',
        categoryEs: categoryEs || 'Tour',
        durationHours,
        maxGroupSize,
        imageUrls: imageUrls || [],
        featuresEn: [],
        featuresPt: [],
        featuresEs: [],
        excludedEn: [],
        excludedPt: [],
        excludedEs: [],
        active: active ?? true,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Product create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
