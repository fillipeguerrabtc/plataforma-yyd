import { EmailJob } from './queue';

// TODO: Implement with nodemailer in FASE 3.1
export async function sendBookingConfirmation(job: EmailJob) {
  console.log('📧 [STUB] Sending booking confirmation email to:', job.to);
  // Will be implemented with nodemailer + templates
}

export async function sendBookingReminder(job: EmailJob) {
  console.log('📧 [STUB] Sending booking reminder email to:', job.to);
  // Will be implemented with nodemailer + templates
}

export async function sendVoucher(job: EmailJob) {
  console.log('📧 [STUB] Sending voucher email to:', job.to);
  // Will be implemented with nodemailer + templates
}
