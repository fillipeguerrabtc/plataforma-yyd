import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        seasonPrices: {
          orderBy: { startMonth: 'asc' },
        },
        activities: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Tour não encontrado' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Product API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
