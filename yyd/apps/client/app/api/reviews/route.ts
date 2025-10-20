import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireCustomerAuth } from '@/lib/customer-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status') || 'published';

    const where: any = { status };
    if (productId) {
      where.productId = productId;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        booking: {
          include: {
            customer: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const customer = requireCustomerAuth(request);
    const body = await request.json();

    const { bookingId, rating, npsScore, comment, language } = body;

    // Verify booking belongs to customer
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.customerId !== customer.customerId) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    // Check if review already exists
    const existing = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existing) {
      return NextResponse.json({ error: 'Review já existe para esta reserva' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        customerId: customer.customerId,
        productId: booking.productId,
        rating,
        npsScore: npsScore || null,
        comment: comment || null,
        language: language || 'en',
        status: 'pending', // Moderate before publishing
      },
    });

    return NextResponse.json(review);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    console.error('Review create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
