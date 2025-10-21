import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  let event: Stripe.Event;

  // In development/test mode without webhook secret, parse body directly
  if (!webhookSecret) {
    console.warn('⚠️  STRIPE_WEBHOOK_SECRET not set - using unsafe mode for development');
    try {
      event = JSON.parse(body);
    } catch (err: any) {
      console.error('Failed to parse webhook body:', err.message);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
  } else {
    // Production mode with signature verification
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedIntent);
        break;

      case 'payment_intent.canceled':
        const canceledIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCanceled(canceledIntent);
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

  // Check if this payment was already processed (idempotency check)
  const existingPayment = await prisma.payment.findFirst({
    where: { stripePaymentIntent: paymentIntent.id },
  });

  if (existingPayment && existingPayment.status === 'succeeded' && booking.status === 'confirmed') {
    console.log(`✅ Payment already processed for booking ${bookingId} - idempotent skip`);
    return;
  }

  // CRITICAL: Verify payment amount matches booking total (base + addons)
  const baseAmount = parseFloat(booking.priceEur.toString());
  const addonsAmount = parseFloat((booking.addonsTotal || 0).toString());
  const totalAmount = baseAmount + addonsAmount;
  const expectedAmount = Math.round(totalAmount * 100);
  
  if (paymentIntent.amount !== expectedAmount) {
    console.error(
      `⚠️ Payment amount mismatch for booking ${bookingId}: expected €${totalAmount} (${expectedAmount} cents), got ${paymentIntent.amount} cents`
    );
  }

  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'confirmed',
      confirmedAt: new Date(),
    },
  });

  // Update payment record (created by create-intent OR checkout-session)
  await prisma.payment.updateMany({
    where: { stripePaymentIntent: paymentIntent.id },
    data: {
      status: 'succeeded',
      paidAt: new Date(),
    },
  });

  // Create calendar event (AvailabilitySlot) - use upsert to handle duplicates
  await prisma.availabilitySlot.upsert({
    where: {
      productId_date_startTime: {
        productId: booking.productId,
        date: booking.date,
        startTime: booking.startTime || '09:00',
      },
    },
    create: {
      productId: booking.productId,
      date: booking.date,
      startTime: booking.startTime || '09:00',
      endTime: `${parseInt((booking.startTime || '09:00').split(':')[0]) + booking.product.durationHours}:00`,
      maxSlots: 1,
      bookedSlots: 1,
      status: 'booked',
    },
    update: {
      bookedSlots: { increment: 1 },
    },
  });

  // Send voucher email (idempotent with unique job ID)
  const { emailQueue } = await import('@/lib/queue');
  await emailQueue.add(
    {
      to: booking.customer.email,
      template: 'voucher',
      bookingId: booking.id,
      locale: booking.locale || 'en',
    },
    { jobId: `voucher-${booking.id}`, removeOnComplete: true }
  );

  // Schedule reminder for 24h before tour (idempotent with unique job ID)
  const tourDate = new Date(booking.date);
  const reminderDate = new Date(tourDate.getTime() - 24 * 60 * 60 * 1000);

  if (reminderDate > new Date()) {
    await emailQueue.add(
      {
        to: booking.customer.email,
        template: 'booking-reminder',
        bookingId: booking.id,
        locale: booking.locale || 'en',
      },
      { 
        jobId: `reminder-${booking.id}`,
        delay: reminderDate.getTime() - Date.now(),
        removeOnComplete: true,
      }
    );
  }

  // Update customer stats (check if not already updated for this booking)
  const customer = await prisma.customer.findUnique({ where: { id: booking.customerId } });
  if (customer && (!customer.lastBookingAt || customer.lastBookingAt < booking.createdAt)) {
    // Not yet updated (first purchase OR older lastBookingAt), so update now
    await prisma.customer.update({
      where: { id: booking.customerId },
      data: {
        totalBookings: { increment: 1 },
        totalSpent: { increment: booking.priceEur },
        lastBookingAt: new Date(),
      },
    });
  }

  console.log(`✅ Booking ${bookingId} confirmed for ${booking.customer.name}`);
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  try {
    const {
      tourId,
      customerId,
      date,
      numberOfPeople,
      startTime,
      pickupLocation,
      specialRequests,
    } = session.metadata || {};

    if (!tourId || !customerId) {
      console.error('Missing metadata in checkout session');
      return;
    }

    // Check if this checkout session was already processed (idempotency)
    const paymentIntentId = session.payment_intent as string;
    if (paymentIntentId) {
      const existingPayment = await prisma.payment.findFirst({
        where: { stripePaymentIntent: paymentIntentId },
      });

      if (existingPayment && existingPayment.status === 'succeeded') {
        console.log(`✅ Checkout session already processed: ${session.id} - idempotent skip`);
        return;
      }
    }

    // Generate unique booking number
    const bookingNumber = `YYD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        productId: tourId,
        customerId,
        date: new Date(date!),
        numberOfPeople: parseInt(numberOfPeople || '2'),
        startTime: startTime || '09:00',
        pickupLocation: pickupLocation || '',
        specialRequests: specialRequests || '',
        priceEur: (session.amount_total || 0) / 100,
        season: 'high', // TODO: Calculate based on date
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripePaymentIntent: session.payment_intent as string || '',
        amount: (session.amount_total || 0) / 100,
        currency: 'EUR',
        status: 'succeeded',
        paidAt: new Date(),
        metadata: {
          sessionId: session.id,
        },
      },
    });

    // Create availability slot (use upsert for idempotency)
    const product = await prisma.product.findUnique({ where: { id: booking.productId } });
    if (product) {
      await prisma.availabilitySlot.upsert({
        where: {
          productId_date_startTime: {
            productId: booking.productId,
            date: booking.date,
            startTime: booking.startTime,
          },
        },
        create: {
          productId: booking.productId,
          date: booking.date,
          startTime: booking.startTime,
          endTime: `${parseInt(booking.startTime.split(':')[0]) + product.durationHours}:00`,
          maxSlots: 1,
          bookedSlots: 1,
          status: 'booked',
        },
        update: {
          bookedSlots: { increment: 1 },
        },
      });
    }

    // Update customer stats
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        totalBookings: { increment: 1 },
        totalSpent: { increment: booking.priceEur },
        lastBookingAt: new Date(),
      },
    });

    // Send voucher email (idempotent with unique job ID)
    const { emailQueue } = await import('@/lib/queue');
    await emailQueue.add(
      {
        to: session.customer_email || '',
        template: 'voucher',
        bookingId: booking.id,
        locale: 'en',
      },
      { jobId: `voucher-${booking.id}`, removeOnComplete: true }
    );

    // Schedule reminder 24h before (idempotent with unique job ID)
    const tourDate = new Date(booking.date);
    const reminderDate = new Date(tourDate.getTime() - 24 * 60 * 60 * 1000);

    if (reminderDate > new Date()) {
      await emailQueue.add(
        {
          to: session.customer_email || '',
          template: 'booking-reminder',
          bookingId: booking.id,
          locale: 'en',
        },
        { 
          jobId: `reminder-${booking.id}`,
          delay: reminderDate.getTime() - Date.now(),
          removeOnComplete: true,
        }
      );
    }

    console.log('✅ Booking created successfully from checkout:', booking.id);
  } catch (error: any) {
    console.error('Error processing checkout:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;

  if (!bookingId) {
    console.error('No bookingId in payment metadata');
    return;
  }

  // Update payment record
  await prisma.payment.updateMany({
    where: { stripePaymentIntent: paymentIntent.id },
    data: { status: 'failed' },
  });

  // Update booking status to failed
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'payment_failed',
    },
  });

  console.log(`❌ Payment failed for booking ${bookingId}`);
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;

  if (!bookingId) {
    console.error('No bookingId in payment metadata');
    return;
  }

  // Update payment record
  await prisma.payment.updateMany({
    where: { stripePaymentIntent: paymentIntent.id },
    data: { status: 'canceled' },
  });

  // Update booking status to canceled
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'cancelled',
    },
  });

  console.log(`🚫 Payment canceled for booking ${bookingId}`);
}
