import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(request, 'products', 'update');

    const prices = await prisma.productSeasonPrice.findMany({
      where: { productId: params.id },
      orderBy: [{ season: 'asc' }, { startMonth: 'asc' }],
    });

    return NextResponse.json(prices);
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

    // Delete all existing prices
    await prisma.productSeasonPrice.deleteMany({
      where: { productId: params.id },
    });

    // Create new prices
    const created = await prisma.productSeasonPrice.createMany({
      data: body.prices.map((p: any) => ({
        productId: params.id,
        season: p.season,
        startMonth: p.startMonth,
        endMonth: p.endMonth,
        tier: p.tier,
        minPeople: p.minPeople,
        maxPeople: p.maxPeople,
        priceEur: p.priceEur,
        pricePerPerson: p.pricePerPerson,
      })),
    });

    return NextResponse.json({ success: true, created: created.count });
  } catch (error: any) {
    console.error('Pricing update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
