import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sendTestEmail() {
  try {
    console.log('🧪 Creating test booking for fillipe182@hotmail.com...');

    // Find a tour
    const tour = await prisma.product.findFirst({
      where: { active: true },
    });

    if (!tour) {
      throw new Error('No active tours found');
    }
    console.log('✅ Found tour:', tour.name);

    // Create or find customer
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

    // Create booking with all required fields
    const bookingNumber = `YYD-${Date.now()}-EMAILTEST`;
    const tourDate = new Date('2025-11-01');
    
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: customer.id,
        productId: tour.id,
        date: tourDate,
        tourDate: tourDate,
        numberOfGuests: 2,
        totalPrice: 200,
        status: 'pending',
        locale: 'en',
      },
    });
    console.log('✅ Booking created:', bookingNumber);

    // Create payment intent
    const paymentIntentId = `pi_emailtest_${Date.now()}`;
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

    console.log('\n📧 Simulating webhook to send confirmation email...\n');
    
    // Import and run email sending
    const { sendEmail } = await import('../lib/replitmail');
    const { generateBookingConfirmationEmail } = await import('../lib/email');
    
    // Update booking to confirmed
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'confirmed' },
    });
    
    // Update payment to succeeded
    await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { status: 'succeeded' },
    });
    
    // Fetch booking with all relations
    const bookingWithRelations = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        customer: true,
        product: true,
        selectedAddons: {
          include: { addon: true },
        },
      },
    });
    
    if (!bookingWithRelations) {
      throw new Error('Booking not found');
    }
    
    // Generate email content
    const { subject, html, text } = generateBookingConfirmationEmail(
      bookingWithRelations,
      bookingWithRelations.customer,
      bookingWithRelations.product,
      'en'
    );
    
    // Send email
    console.log('📧 Sending email to:', email);
    const result = await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
    
    console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
    console.log('📬 Message ID:', result.messageId);
    console.log('✅ Accepted:', result.accepted);
    console.log('\n🎉 Check your inbox at fillipe182@hotmail.com!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

sendTestEmail();
