import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireCustomerAuth } from '@/lib/customer-auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, customerEmail } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        product: true,
        payments: true,
        selectedAddons: {
          include: {
            addon: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Optional: Verify ownership if customer is logged in
    try {
      const customer = requireCustomerAuth(request);
      if (customer && booking.customerId !== customer.customerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } catch {
      // No auth - new customer booking is OK
    }

    // Check if already paid
    const existingPayment = booking.payments.find((p) => p.status === 'succeeded');
    if (existingPayment) {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    // Calculate total with add-ons
    const basePrice = Number(booking.priceEur);
    const addonsTotal = Number(booking.addonsTotal);
    const totalAmount = basePrice + addonsTotal;
    const amountCents = Math.round(totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        customerId: booking.customerId,
        productId: booking.productId,
      },
      description: `YYD Tour: ${booking.product.titleEn} - ${booking.bookingNumber}`,
      receipt_email: customerEmail || booking.customer.email,
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripePaymentIntent: paymentIntent.id,
        amount: totalAmount,
        currency: 'EUR',
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
    });
  } catch (error: any) {
    console.error('❌ Payment intent error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payment intent' }, { status: 500 });
  }
}
