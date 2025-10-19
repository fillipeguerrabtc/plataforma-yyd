import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { 
        slug: params.slug,
        active: true,
      },
      include: {
        seasonPrices: {
          orderBy: { minPeople: 'asc' },
        },
        options: {
          orderBy: { id: 'asc' },
        },
        activities: {
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching tour:', error);
    return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 });
  }
}
