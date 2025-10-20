import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to find by ID first, then by slug
    let product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        seasonPrices: {
          orderBy: { startMonth: 'asc' },
        },
        activities: {
          orderBy: { sortOrder: 'asc' },
        },
        options: true,
      },
    });

    // If not found by ID, try finding by slug
    if (!product) {
      product = await prisma.product.findFirst({
        where: { slug: params.id },
        include: {
          seasonPrices: {
            orderBy: { startMonth: 'asc' },
          },
          activities: {
            orderBy: { sortOrder: 'asc' },
          },
          options: true,
        },
      });
    }

    if (!product) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Transform to camelCase with decimal conversion
    const response = {
      id: product.id,
      slug: product.slug,
      nameEn: product.nameEn,
      namePt: product.namePt,
      nameEs: product.nameEs,
      descriptionEn: product.descriptionEn,
      descriptionPt: product.descriptionPt,
      descriptionEs: product.descriptionEs,
      tourType: product.tourType,
      durationHours: product.durationHours,
      maxCapacity: product.maxCapacity,
      imageUrl: product.imageUrl,
      seasonPrices: product.seasonPrices.map((sp: any) => ({
        id: sp.id,
        season: sp.season,
        priceEur: Number(sp.priceEur),
        minPeople: sp.minPeople,
        maxPeople: sp.maxPeople,
      })),
      activities: product.activities.map((a: any) => ({
        id: a.id,
        nameEn: a.nameEn,
        namePt: a.namePt,
        nameEs: a.nameEs,
        descriptionEn: a.descriptionEn,
        descriptionPt: a.descriptionPt,
        descriptionEs: a.descriptionEs,
        included: a.included,
        sortOrder: a.sortOrder,
      })),
      options: product.options.map((o: any) => ({
        id: o.id,
        code: o.code,
        nameEn: o.nameEn,
        namePt: o.namePt,
        nameEs: o.nameEs,
      })),
    };

    return NextResponse.json({ success: true, product: response });
  } catch (error: any) {
    console.error('Product API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
