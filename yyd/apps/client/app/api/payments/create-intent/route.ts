import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireCustomerAuth } from '@/lib/customer-auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const customer = requireCustomerAuth(request);
    const body = await request.json();

    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID obrigatório' }, { status: 400 });
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        product: true,
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    // Verify ownership
    if (booking.customerId !== customer.customerId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Check if already paid
    const existingPayment = booking.payments.find((p) => p.status === 'succeeded');
    if (existingPayment) {
      return NextResponse.json({ error: 'Reserva já foi paga' }, { status: 400 });
    }

    // Create Stripe payment intent
    const amountCents = Math.round(parseFloat(booking.priceEur.toString()) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        customerId: booking.customerId,
        productId: booking.productId,
      },
      description: `YYD Tour: ${booking.product.titleEn} - ${booking.bookingNumber}`,
      receipt_email: booking.customer.email,
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripePaymentIntent: paymentIntent.id,
        amount: booking.priceEur,
        currency: 'EUR',
        status: 'pending',
        metadata: {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
        },
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    console.error('Payment intent error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
