import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        booking: {
          include: {
            product: {
              select: {
                titlePt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('Reviews API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, status } = body;

    if (!reviewId || !status) {
      return NextResponse.json({ error: 'reviewId and status required' }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        moderatedAt: new Date(),
      },
    });

    return NextResponse.json(review);
  } catch (error: any) {
    console.error('Review update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
