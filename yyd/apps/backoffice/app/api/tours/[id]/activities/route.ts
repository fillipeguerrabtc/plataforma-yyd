import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';
import { activitySchema } from '@/lib/validators';

/**
 * GET /api/tours/[id]/activities
 * List all activities for a tour
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(request, 'products', 'read');

    const activities = await prisma.productActivity.findMany({
      where: { productId: params.id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ activities });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/tours/[id]/activities
 * Create a new activity
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'products', 'update');

    const rawData = await request.json();
    const validationResult = activitySchema.safeParse({
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

    const activity = await prisma.productActivity.create({
      data,
    });

    // Audit logging
    await logCRUD(
      user.userId,
      user.email,
      'create',
      'products_activities',
      activity.id,
      { before: null, after: activity },
      request
    );

    return NextResponse.json({ success: true, activity });
  } catch (error: any) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
