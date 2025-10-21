/**
 * Script para testar webhook da Stripe manualmente
 * 
 * Execute: npx tsx scripts/test-webhook.ts <bookingId> <paymentIntentId>
 */

import { prisma } from '../lib/prisma';

async function simulateWebhookSuccess(bookingId: string, paymentIntentId: string) {
  console.log('🧪 Simulating Stripe webhook: payment_intent.succeeded');
  console.log('   Booking ID:', bookingId);
  console.log('   Payment Intent:', paymentIntentId);

  // Fetch booking to validate
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      product: true,
      customer: true,
    },
  });

  if (!booking) {
    console.error('❌ Booking not found');
    process.exit(1);
  }

  console.log('✅ Booking found:', booking.bookingNumber);
  console.log('   Status:', booking.status);
  console.log('   Price:', booking.priceEur.toString(), 'EUR');

  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'confirmed',
      confirmedAt: new Date(),
    },
  });

  console.log('✅ Booking confirmed!');

  // Create or update payment record
  const existingPayment = await prisma.payment.findFirst({
    where: {
      bookingId,
      stripePaymentIntent: paymentIntentId,
    },
  });

  let payment;
  if (existingPayment) {
    payment = await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: 'succeeded',
        paidAt: new Date(),
      },
    });
    console.log('✅ Payment updated:', payment.id);
  } else {
    payment = await prisma.payment.create({
      data: {
        bookingId,
        stripePaymentIntent: paymentIntentId,
        amount: booking.priceEur,
        currency: 'EUR',
        status: 'succeeded',
        paidAt: new Date(),
        metadata: {},
      },
    });
    console.log('✅ Payment created:', payment.id);
  }

  // Create calendar event
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

  console.log('✅ Calendar event created');

  // Update customer stats
  await prisma.customer.update({
    where: { id: booking.customerId },
    data: {
      totalBookings: { increment: 1 },
      totalSpent: { increment: booking.priceEur },
      lastBookingAt: new Date(),
    },
  });

  console.log('✅ Customer stats updated');
  console.log('\n🎉 Webhook simulation complete! Booking is now confirmed.');
}

// Get arguments
const bookingId = process.argv[2];
const paymentIntentId = process.argv[3] || 'pi_test_' + Date.now();

if (!bookingId) {
  console.error('Usage: npx tsx scripts/test-webhook.ts <bookingId> [paymentIntentId]');
  process.exit(1);
}

simulateWebhookSuccess(bookingId, paymentIntentId)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
