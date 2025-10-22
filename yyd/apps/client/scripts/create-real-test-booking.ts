import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestBooking() {
  try {
    console.log('🧪 Creating test booking with real email...');

    // Find a tour
    const tour = await prisma.product.findFirst({
      where: { active: true },
    });

    if (!tour) {
      throw new Error('No active tours found');
    }
    console.log('✅ Found tour:', tour.name);

    // Create or find customer with the real email
    const email = 'fillipe182@hotmail.com';
    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email,
          firstName: 'Fillipe',
          lastName: 'Test',
          phone: '+351912345678',
        },
      });
      console.log('✅ Customer created:', email);
    } else {
      console.log('✅ Customer found:', email);
    }

    // Create booking
    const bookingNumber = `YYD-${Date.now()}-TEST`;
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: customer.id,
        productId: tour.id,
        tourDate: new Date('2025-11-01'),
        numberOfGuests: 2,
        totalPrice: 200,
        status: 'pending',
        locale: 'en',
      },
    });
    console.log('✅ Booking created:', bookingNumber);

    // Create payment intent
    const paymentIntentId = `pi_real_test_${Date.now()}`;
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripePaymentIntentId: paymentIntentId,
        amount: 200,
        currency: 'EUR',
        status: 'pending',
      },
    });
    console.log('✅ Payment created:', paymentIntentId);

    console.log('\n📝 Now run the webhook script:');
    console.log(`   npx tsx scripts/test-webhook.ts ${booking.id} ${paymentIntentId}`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestBooking();
