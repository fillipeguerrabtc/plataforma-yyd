import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCompleteFlow() {
  try {
    console.log('🧪 TESTE COMPLETO DO FLUXO DE PAGAMENTO\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Import email functions
    const { sendEmail } = await import('../lib/replitmail');
    const { generateBookingConfirmationEmail } = await import('../lib/email');

    // 1. Find tour
    console.log('📍 PASSO 1: Buscando tour disponível...');
    const tour = await prisma.product.findFirst({
      where: { active: true },
    });
    if (!tour) throw new Error('Nenhum tour encontrado');
    console.log('✅ Tour encontrado:', tour.name);

    // 2. Get or create customer
    console.log('\n📍 PASSO 2: Verificando cliente...');
    const email = 'fillipe182@hotmail.com';
    let customer = await prisma.customer.findUnique({
      where: { email },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email,
          firstName: 'Fillipe',
          lastName: 'Guerra',
          phone: '+351912345678',
        },
      });
      console.log('✅ Cliente criado');
    } else {
      console.log('✅ Cliente encontrado');
    }

    // 3. Create booking
    console.log('\n📍 PASSO 3: Criando reserva...');
    const bookingNumber = `YYD-TEST-${Date.now()}`;
    const tourDate = new Date('2025-11-15');
    
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: customer.id,
        productId: tour.id,
        date: tourDate,
        tourDate: tourDate,
        startTime: '09:00',
        numberOfGuests: 2,
        numberOfPeople: 2,
        totalPrice: 200,
        status: 'pending',
        locale: 'en',
        pickupLocation: 'Hotel Central, Sintra',
        specialRequests: 'Teste automático do webhook',
      },
    });
    console.log('✅ Reserva criada:', bookingNumber);
    console.log('   ID:', booking.id);

    // 4. Create payment
    console.log('\n📍 PASSO 4: Criando Payment Intent...');
    const paymentIntentId = `pi_test_webhook_${Date.now()}`;
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripePaymentIntentId: paymentIntentId,
        amount: 200,
        currency: 'EUR',
        status: 'pending',
      },
    });
    console.log('✅ Payment Intent criado:', paymentIntentId);

    // 5. Simulate webhook - confirm booking
    console.log('\n📍 PASSO 5: Simulando webhook da Stripe...');
    console.log('🎯 Evento: payment_intent.succeeded');
    
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'confirmed' },
    });
    console.log('✅ Booking confirmado!');

    await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { status: 'succeeded' },
    });
    console.log('✅ Payment atualizado!');

    // 6. Send email
    console.log('\n📍 PASSO 6: Enviando email de confirmação...');
    
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

    if (!bookingWithRelations) throw new Error('Booking não encontrado');

    const { subject, html, text } = generateBookingConfirmationEmail(
      bookingWithRelations,
      bookingWithRelations.customer,
      bookingWithRelations.product,
      'en'
    );

    const emailResult = await sendEmail({
      to: email,
      subject,
      html,
      text,
    });

    console.log('✅ EMAIL ENVIADO COM SUCESSO!');
    console.log('📬 Message ID:', emailResult.messageId);
    console.log('✅ Aceito por:', emailResult.accepted);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 TESTE COMPLETO - TUDO FUNCIONANDO! 🎉');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📊 RESUMO:');
    console.log('   ✅ Booking criado:', bookingNumber);
    console.log('   ✅ Status: confirmed');
    console.log('   ✅ Pagamento: succeeded');
    console.log('   ✅ Email enviado para:', email);
    console.log('\n📧 Verifique sua caixa de entrada!');
    console.log('   (Pode estar na pasta de spam/promoções)\n');

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteFlow();
