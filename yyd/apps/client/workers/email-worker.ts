import { emailQueue, EmailJob } from '../lib/queue';
import { emailService } from '../lib/email';
import { prisma } from '../lib/prisma';

emailQueue.process(async (job) => {
  const data: EmailJob = job.data;

  console.log(`📧 Processing email job: ${data.template} to ${data.to}`);

  try {
    let result;

    switch (data.template) {
      case 'booking-confirmation': {
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

        result = await emailService.sendBookingConfirmation(
          booking,
          booking.customer,
          booking.product,
          data.locale || booking.locale || 'en'
        );
        break;
      }

      case 'booking-reminder': {
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

        result = await emailService.sendBookingReminder(
          booking,
          booking.customer,
          booking.product,
          data.locale || booking.locale || 'en'
        );
        break;
      }

      case 'voucher': {
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

        // Generate voucher PDF if not provided
        let voucherPdf: Buffer;
        
        if (data.voucherPdf) {
          voucherPdf = Buffer.from(data.voucherPdf, 'base64');
        } else {
          // Generate PDF dynamically
          const { generateVoucherPDF } = await import('../lib/pdf');
          voucherPdf = await generateVoucherPDF({
            bookingNumber: booking.bookingNumber,
            customerName: booking.customer.name,
            tourTitle: booking.product.title,
            date: booking.date,
            time: booking.startTime,
            numberOfPeople: booking.numberOfPeople,
            pickupLocation: booking.pickupLocation,
            priceEur: parseFloat(booking.priceEur.toString()),
            specialRequests: booking.specialRequests || undefined,
            qrCodeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking.id}`,
          });
        }

        result = await emailService.sendVoucherEmail(
          booking,
          booking.customer,
          booking.product,
          voucherPdf,
          data.locale || booking.locale || 'en'
        );
        break;
      }

      case 'booking-cancelled':
        // TODO: Implement cancellation email template
        console.log('⚠️ Cancellation email not implemented yet');
        result = false;
        break;

      default:
        throw new Error(`Unknown email template: ${data.template}`);
    }

    return { success: result, sentAt: new Date().toISOString() };
  } catch (error: any) {
    console.error(`❌ Email job failed:`, error);
    throw error; // Bull will retry based on job options
  }
});

emailQueue.on('completed', (job, result) => {
  console.log(`✅ Email job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Email job ${job?.id} failed:`, err.message);
});

console.log('📧 Email worker started and listening for jobs...');
