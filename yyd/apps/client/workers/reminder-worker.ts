import { reminderQueue, ReminderJob } from '../lib/queue';
import { prisma } from '../lib/prisma';
import { sendEmail } from '../lib/queue';
import { sendWhatsAppMessage } from '../lib/whatsapp';

reminderQueue.process(async (job) => {
  const data: ReminderJob = job.data;

  console.log(`Processing reminder: ${data.type} for booking ${data.bookingId}`);

  try {
    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        customer: true,
        product: true,
      },
    });

    if (!booking) {
      throw new Error(`Booking ${data.bookingId} not found`);
    }

    // Check if booking is still confirmed
    if (booking.status !== 'confirmed') {
      console.log(`Skipping reminder - booking status is ${booking.status}`);
      return { skipped: true, reason: `Status: ${booking.status}` };
    }

    // Send reminder based on channel
    if (data.channel === 'email') {
      await sendEmail({
        to: booking.customer.email,
        subject: `Lembrete: Seu tour ${data.type === '48h' ? 'em 2 dias' : 'amanhã'}!`,
        template: 'booking-reminder',
        data: {
          customerName: booking.customer.name,
          tourName: booking.product[`title${booking.locale === 'pt' ? 'Pt' : booking.locale === 'es' ? 'Es' : 'En'}` as 'titleEn'],
          date: booking.date,
          time: booking.startTime,
          numberOfPeople: booking.numberOfPeople,
          pickupLocation: booking.pickupLocation,
        },
        locale: booking.locale,
      });
    } else if (data.channel === 'whatsapp' && booking.customer.whatsapp) {
      await sendWhatsAppMessage(
        booking.customer.whatsapp,
        `Olá ${booking.customer.name}! Lembrete: Seu tour está agendado para ${data.type === '48h' ? 'depois de amanhã' : 'amanhã'} às ${booking.startTime}. Estamos ansiosos para recebê-lo! 🚗✨`
      );
    }

    return {
      success: true,
      sentAt: new Date().toISOString(),
      channel: data.channel,
    };
  } catch (error: any) {
    console.error(`Reminder job failed:`, error);
    throw error;
  }
});

reminderQueue.on('completed', (job, result) => {
  console.log(`✅ Reminder job ${job.id} completed:`, result);
});

reminderQueue.on('failed', (job, err) => {
  console.error(`❌ Reminder job ${job?.id} failed:`, err.message);
});

console.log('⏰ Reminder worker started and listening for jobs...');
