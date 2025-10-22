import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testWebhook() {
  try {
    console.log('🧪 TESTANDO WEBHOOK COMPLETO\n');

    // Find or create a pending booking
    let booking = await prisma.booking.findFirst({
      where: { 
        status: 'pending',
        customer: { email: 'fillipe182@hotmail.com' }
      },
      include: {
        customer: true,
        product: true,
        payments: true,
      }
    });

    if (!booking) {
      console.log('❌ Nenhum booking pendente encontrado para fillipe182@hotmail.com');
      console.log('ℹ️  Crie uma reserva no site primeiro e depois rode este teste.');
      return;
    }

    console.log('✅ Booking encontrado:', booking.bookingNumber);
    console.log('   Status atual:', booking.status);
    console.log('   Cliente:', booking.customer.email);
    
    const payment = booking.payments[0];
    if (!payment) {
      console.log('❌ Nenhum pagamento encontrado');
      return;
    }

    console.log('\n🎯 Simulando webhook: payment_intent.succeeded\n');

    // Import webhook logic
    const { sendEmail } = await import('../lib/replitmail');
    const { generateBookingConfirmationEmail } = await import('../lib/email');

    // 1. Update booking status
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'confirmed' },
    });
    console.log('✅ Booking confirmado!');

    // 2. Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'succeeded' },
    });
    console.log('✅ Payment atualizado!');

    // 3. Send email
    const bookingWithRelations = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        customer: true,
        product: true,
        selectedAddons: { include: { addon: true } },
      },
    });

    if (bookingWithRelations) {
      const { subject, html, text } = generateBookingConfirmationEmail(
        bookingWithRelations,
        bookingWithRelations.customer,
        bookingWithRelations.product,
        bookingWithRelations.locale || 'en'
      );

      console.log('📧 Enviando email para:', bookingWithRelations.customer.email);
      
      const result = await sendEmail({
        to: bookingWithRelations.customer.email,
        subject,
        html,
        text,
      });

      console.log('✅ EMAIL ENVIADO!');
      console.log('   Message ID:', result.messageId);
      console.log('   Aceito:', result.accepted);
    }

    console.log('\n🎉 WEBHOOK TESTADO COM SUCESSO!');
    console.log('📧 Verifique o email: fillipe182@hotmail.com\n');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testWebhook();
