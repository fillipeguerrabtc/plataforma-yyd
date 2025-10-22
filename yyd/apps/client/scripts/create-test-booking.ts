/**
 * Script to create a test booking for email testing
 */

import { prisma } from '../lib/prisma';

async function createTestBooking() {
  console.log('🧪 Creating test booking for email test...');

  // Find the Full-Day tour
  const tour = await prisma.product.findFirst({
    where: { slug: 'personalized-full-day-tour' },
  });

  if (!tour) {
    console.error('❌ Tour not found');
    process.exit(1);
  }

  console.log('✅ Found tour:', tour.titleEn);

  // Create test customer
  const customer = await prisma.customer.upsert({
    where: { email: 'test-email@example.com' },
    update: {},
    create: {
      name: 'Test Email Customer',
      email: 'test-email@example.com',
      phone: '+351912345678',
      locale: 'en',
      source: 'direct',
    },
  });

  console.log('✅ Customer created:', customer.email);

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      bookingNumber: `YYD-${Date.now()}-TEST`,
      productId: tour.id,
      customerId: customer.id,
      date: new Date('2025-11-15'),
      numberOfPeople: 2,
      startTime: '09:00',
      pickupLocation: 'Test Hotel Sintra',
      priceEur: 200,
      season: 'high',
      status: 'pending',
      locale: 'en',
    },
  });

  console.log('✅ Booking created:', booking.bookingNumber);

  // Create payment intent
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      stripePaymentIntent: `pi_test_email_${Date.now()}`,
      amount: 200,
      currency: 'EUR',
      status: 'pending',
    },
  });

  console.log('✅ Payment created:', payment.stripePaymentIntent);
  console.log('');
  console.log('📝 Now run the webhook script:');
  console.log('   npx tsx scripts/test-webhook.ts', booking.id, payment.stripePaymentIntent);
}

createTestBooking()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
