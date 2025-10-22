import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requirePermission(req, 'products', 'update');
    
    const body = await req.json();

    const seasonPrice = await prisma.productSeasonPrice.create({
      data: {
        productId: params.id,
        season: body.season,
        startMonth: body.startMonth,
        endMonth: body.endMonth,
        tier: body.tier,
        minPeople: body.minPeople,
        maxPeople: body.maxPeople || null,
        priceEur: parseFloat(body.priceEur),
        pricePerPerson: body.pricePerPerson || false,
      },
    });

    return NextResponse.json(seasonPrice);
  } catch (error: any) {
    console.error('Error creating season price:', error);
    return NextResponse.json({ error: error.message || 'Failed to create season price' }, { status: 500 });
  }
}
