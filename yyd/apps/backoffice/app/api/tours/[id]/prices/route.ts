import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';
import { priceSchema } from '@/lib/validators';

/**
 * GET /api/tours/[id]/prices
 * List all season prices for a tour
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(request, 'products', 'read');

    const prices = await prisma.productSeasonPrice.findMany({
      where: { productId: params.id },
      orderBy: [{ season: 'asc' }, { tier: 'asc' }],
    });

    return NextResponse.json({ prices });
  } catch (error: any) {
    console.error('Error fetching prices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/tours/[id]/prices
 * Create a new season price
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'products', 'update');

    const rawData = await request.json();
    const validationResult = priceSchema.safeParse({
      ...rawData,
      productId: params.id,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create price with uniqueness check
    try {
      const price = await prisma.productSeasonPrice.create({
        data: {
          productId: params.id,
          season: data.season,
          tier: data.tier,
          startMonth: data.startMonth,
          endMonth: data.endMonth,
          minPeople: data.minPeople,
          maxPeople: data.maxPeople,
          priceEur: data.priceEur,
          pricePerPerson: data.pricePerPerson,
        },
      });

      // Audit logging for traceability
      await logCRUD(
        user.userId,
        user.email,
        'create',
        'products_prices',
        price.id,
        { before: null, after: price },
        request
      );

      return NextResponse.json({ success: true, price });
    } catch (prismaError: any) {
      // Handle unique constraint violation
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Já existe um preço para esta combinação de temporada e tier' },
          { status: 409 }
        );
      }
      throw prismaError;
    }
  } catch (error: any) {
    console.error('Error creating price:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
