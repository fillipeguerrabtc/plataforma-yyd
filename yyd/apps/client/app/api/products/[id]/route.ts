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
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
        },
        options: {
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
        },
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
            where: { active: true },
            orderBy: { sortOrder: 'asc' },
          },
          options: {
            where: { active: true },
            orderBy: { sortOrder: 'asc' },
          },
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
      titleEn: product.titleEn,
      titlePt: product.titlePt,
      titleEs: product.titleEs,
      descriptionEn: product.descriptionEn,
      descriptionPt: product.descriptionPt,
      descriptionEs: product.descriptionEs,
      categoryEn: product.categoryEn,
      categoryPt: product.categoryPt,
      categoryEs: product.categoryEs,
      durationHours: product.durationHours,
      maxGroupSize: product.maxGroupSize,
      featuresEn: product.featuresEn,
      featuresPt: product.featuresPt,
      featuresEs: product.featuresEs,
      excludedEn: product.excludedEn,
      excludedPt: product.excludedPt,
      excludedEs: product.excludedEs,
      imageUrls: product.imageUrls,
      highlightedEn: product.highlightedEn,
      highlightedPt: product.highlightedPt,
      highlightedEs: product.highlightedEs,
      bestChoice: product.bestChoice,
      active: product.active,
      seasonPrices: product.seasonPrices.map((sp: any) => ({
        id: sp.id,
        season: sp.season,
        startMonth: sp.startMonth,
        endMonth: sp.endMonth,
        tier: sp.tier,
        priceEur: Number(sp.priceEur),
        pricePerPerson: sp.pricePerPerson,
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
        imageUrl: a.imageUrl,
        sortOrder: a.sortOrder,
      })),
      options: product.options.map((o: any) => ({
        id: o.id,
        nameEn: o.nameEn,
        namePt: o.namePt,
        nameEs: o.nameEs,
        descriptionEn: o.descriptionEn,
        descriptionPt: o.descriptionPt,
        descriptionEs: o.descriptionEs,
        sortOrder: o.sortOrder,
      })),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Product API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
