import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const active = searchParams.get('active') !== 'false'; // Default to true

    if (slug) {
      // Get single product by slug
      const product = await prisma.product.findUnique({
        where: { slug },
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

      if (!product.active && active) {
        return NextResponse.json({ error: 'Tour não disponível' }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    // List all products
    const where: any = {};
    if (active) {
      where.active = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        seasonPrices: {
          orderBy: { startMonth: 'asc' },
        },
        activities: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
