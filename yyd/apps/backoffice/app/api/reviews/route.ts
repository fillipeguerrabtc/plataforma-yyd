import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess, requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    // Require access to reviews resource
    requireResourceAccess(request, 'reviews');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Batch fetch bookings to avoid N+1
    const bookingIds = [...new Set(reviews.map(r => r.bookingId))];
    const bookings = await prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
      },
      include: {
        product: {
          select: {
            titlePt: true,
          },
        },
      },
    });

    // Create booking lookup map
    const bookingMap = new Map(bookings.map(b => [b.id, b]));

    // Enrich reviews with booking data
    const enrichedReviews = reviews.map(review => ({
      ...review,
      booking: bookingMap.get(review.bookingId) || null,
    }));

    return NextResponse.json(enrichedReviews);
  } catch (error: any) {
    console.error('Reviews API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Require permission to update reviews
    const user = requirePermission(request, 'reviews', 'update');
    
    const body = await request.json();
    const { reviewId, status } = body;

    if (!reviewId || !status) {
      return NextResponse.json({ error: 'reviewId and status required' }, { status: 400 });
    }

    // Get before state for audit log
    const before = await prisma.review.findUnique({ where: { id: reviewId } });

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        moderatedBy: user.userId, // Use authenticated user ID
      },
    });

    // Log update in audit log
    await logCRUD(
      user.userId,
      user.email,
      'update',
      'reviews',
      review.id,
      { before, after: review },
      request
    );

    return NextResponse.json(review);
  } catch (error: any) {
    console.error('Review update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
