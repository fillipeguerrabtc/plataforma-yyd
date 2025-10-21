import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';
import { activitySchema } from '@/lib/validators';

/**
 * PUT /api/tours/[id]/activities/[activityId]
 * Update an activity
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const user = requirePermission(request, 'products', 'update');

    const rawData = await request.json();
    const validationResult = activitySchema.partial().safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // CRITICAL: Verify activity belongs to this product (scope validation)
    const before = await prisma.productActivity.findFirst({
      where: {
        id: params.activityId,
        productId: params.id, // Ownership check
      },
    });

    if (!before) {
      return NextResponse.json(
        { error: 'Activity not found or does not belong to this tour' },
        { status: 404 }
      );
    }

    // SECURITY: Prevent productId alteration (ownership change)
    const { productId, ...safeData } = data;

    const activity = await prisma.productActivity.update({
      where: { id: params.activityId },
      data: safeData,
    });

    // Audit logging
    await logCRUD(
      user.userId,
      user.email,
      'update',
      'products_activities',
      activity.id,
      { before, after: activity },
      request
    );

    return NextResponse.json({ success: true, activity });
  } catch (error: any) {
    console.error('Error updating activity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/tours/[id]/activities/[activityId]
 * Delete an activity
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const user = requirePermission(request, 'products', 'delete');

    // CRITICAL: Verify activity belongs to this product (scope validation)
    const before = await prisma.productActivity.findFirst({
      where: {
        id: params.activityId,
        productId: params.id, // Ownership check
      },
    });

    if (!before) {
      return NextResponse.json(
        { error: 'Activity not found or does not belong to this tour' },
        { status: 404 }
      );
    }

    await prisma.productActivity.delete({
      where: { id: params.activityId },
    });

    // Audit logging
    await logCRUD(
      user.userId,
      user.email,
      'delete',
      'products_activities',
      params.activityId,
      { before, after: null },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
