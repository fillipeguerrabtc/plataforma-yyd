import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sendTestEmail() {
  try {
    console.log('📧 Sending test email to fillipe182@hotmail.com...\n');
    
    // Import email functions
    const { sendEmail } = await import('../lib/replitmail');
    const { generateBookingConfirmationEmail } = await import('../lib/email');
    
    // Find or create customer
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
      console.log('✅ Customer created');
    }
    
    // Find any existing tour
    const tour = await prisma.product.findFirst({
      where: { active: true },
    });
    
    if (!tour) {
      throw new Error('No tours found');
    }
    
    // Create a complete booking
    const bookingNumber = `YYD-EMAILTEST-${Date.now()}`;
    const tourDate = new Date('2025-11-01');
    
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: customer.id,
        productId: tour.id,
        date: tourDate,
        tourDate: tourDate,
        startTime: '09:00',
        numberOfGuests: 2,
        totalPrice: 200,
        status: 'confirmed',
        locale: 'en',
        pickupLocation: 'Hotel Central, Sintra',
        specialRequests: 'Email test booking',
      },
      include: {
        customer: true,
        product: true,
        selectedAddons: {
          include: { addon: true },
        },
      },
    });
    
    console.log('✅ Test booking created:', bookingNumber);
    
    // Generate email content
    const { subject, html, text } = generateBookingConfirmationEmail(
      booking,
      booking.customer,
      booking.product,
      'en'
    );
    
    console.log('📨 Sending email...');
    console.log('   To:', email);
    console.log('   Subject:', subject);
    
    // Send email via Replit Mail
    const result = await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
    
    console.log('\n✅ ✅ ✅ EMAIL SENT SUCCESSFULLY! ✅ ✅ ✅');
    console.log('📬 Message ID:', result.messageId);
    console.log('✅ Accepted:', result.accepted);
    console.log('\n🎉 Check your inbox at fillipe182@hotmail.com!');
    console.log('📧 Subject:', subject);
    
  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

sendTestEmail();
