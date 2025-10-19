import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        seasonPrices: true,
        options: true,
        activities: true,
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json({ error: 'Failed to fetch tours' }, { status: 500 });
  }
}
