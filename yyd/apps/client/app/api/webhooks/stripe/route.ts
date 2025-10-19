import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;

  if (!bookingId) {
    console.error('No bookingId in payment metadata');
    return;
  }

  // Fetch booking to validate
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      product: true,
      customer: true,
    },
  });

  if (!booking) {
    console.error(`Booking ${bookingId} not found`);
    return;
  }

  // CRITICAL: Verify payment amount matches booking total
  const expectedAmount = Math.round(parseFloat(booking.totalPriceEur.toString()) * 100);
  if (paymentIntent.amount !== expectedAmount) {
    console.error(
      `Payment amount mismatch for booking ${bookingId}: expected ${expectedAmount}, got ${paymentIntent.amount}`
    );
    // Still create payment record but flag as suspicious
  }

  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'confirmed',
      confirmedAt: new Date(),
    },
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency.toUpperCase(),
      status: 'succeeded',
      paidAt: new Date(),
    },
  });

  // Create calendar event (AvailabilitySlot)
  await prisma.availabilitySlot.create({
    data: {
      productId: booking.productId,
      date: booking.date,
      startTime: '09:00', // Default start time, can be customized
      endTime: `${9 + booking.product.durationHours}:00`, // Based on tour duration
      availableSeats: 0, // Fully booked
      status: 'booked',
      bookingId: booking.id,
    },
  });

  // TODO: Send confirmation email/WhatsApp message to customer
  console.log(`✅ Booking ${bookingId} confirmed for ${booking.customer.name}`);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;

  if (!bookingId) {
    console.error('No bookingId in payment metadata');
    return;
  }

  // Update booking status to failed
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'payment_failed',
    },
  });

  console.log(`❌ Payment failed for booking ${bookingId}`);
}
