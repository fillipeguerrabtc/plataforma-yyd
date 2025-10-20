import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess, requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    // Require access to products resource
    requireResourceAccess(request, 'products');
    
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
    // Require permission to create products
    const user = requirePermission(request, 'products', 'create');
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

    // Log creation in audit log
    await logCRUD(
      user.userId,
      user.email,
      'create',
      'products',
      product.id,
      { before: null, after: product },
      request
    );

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Product create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Require permission to update products
    const user = requirePermission(request, 'products', 'update');
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Get before state for audit log
    const before = await prisma.product.findUnique({ where: { id } });

    const product = await prisma.product.update({
      where: { id },
      data: updates,
    });

    // Log update in audit log
    await logCRUD(
      user.userId,
      user.email,
      'update',
      'products',
      product.id,
      { before, after: product },
      request
    );

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
