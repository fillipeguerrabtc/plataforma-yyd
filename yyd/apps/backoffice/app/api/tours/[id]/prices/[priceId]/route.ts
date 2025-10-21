import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';
import { priceSchema } from '@/lib/validators';

/**
 * PUT /api/tours/[id]/prices/[priceId]
 * Update a season price
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string; priceId: string } }
) {
  try {
    const user = requirePermission(request, 'products', 'update');

    const rawData = await request.json();
    const validationResult = priceSchema.partial().safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // CRITICAL: Verify price belongs to this product (scope validation)
    const before = await prisma.productSeasonPrice.findFirst({
      where: {
        id: params.priceId,
        productId: params.id, // Ownership check
      },
    });

    if (!before) {
      return NextResponse.json(
        { error: 'Price not found or does not belong to this tour' },
        { status: 404 }
      );
    }

    const price = await prisma.productSeasonPrice.update({
      where: { id: params.priceId },
      data,
    });

    // Audit logging for traceability
    await logCRUD(
      user.userId,
      user.email,
      'update',
      'products_prices',
      price.id,
      { before, after: price },
      request
    );

    return NextResponse.json({ success: true, price });
  } catch (error: any) {
    console.error('Error updating price:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/tours/[id]/prices/[priceId]
 * Delete a season price
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; priceId: string } }
) {
  try {
    const user = requirePermission(request, 'products', 'delete');

    // CRITICAL: Verify price belongs to this product (scope validation)
    const before = await prisma.productSeasonPrice.findFirst({
      where: {
        id: params.priceId,
        productId: params.id, // Ownership check
      },
    });

    if (!before) {
      return NextResponse.json(
        { error: 'Price not found or does not belong to this tour' },
        { status: 404 }
      );
    }

    await prisma.productSeasonPrice.delete({
      where: { id: params.priceId },
    });

    // Audit logging for traceability
    await logCRUD(
      user.userId,
      user.email,
      'delete',
      'products_prices',
      params.priceId,
      { before, after: null },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting price:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
