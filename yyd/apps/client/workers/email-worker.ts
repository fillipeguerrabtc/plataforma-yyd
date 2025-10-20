import { emailQueue, EmailJob } from '../lib/queue';
import { sendBookingConfirmation, sendBookingReminder, sendVoucher } from '../lib/email';

emailQueue.process(async (job) => {
  const data: EmailJob = job.data;

  console.log(`Processing email job: ${data.template} to ${data.to}`);

  try {
    switch (data.template) {
      case 'booking-confirmation':
        await sendBookingConfirmation(data);
        break;
      case 'booking-reminder':
        await sendBookingReminder(data);
        break;
      case 'voucher':
        await sendVoucher(data);
        break;
      case 'booking-cancelled':
        // TODO: Implement cancellation email
        break;
      default:
        throw new Error(`Unknown email template: ${data.template}`);
    }

    return { success: true, sentAt: new Date().toISOString() };
  } catch (error: any) {
    console.error(`Email job failed:`, error);
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
