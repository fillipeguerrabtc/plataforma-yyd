import Queue from 'bull';

// Initialize job queues
const redisConfig = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    };

export const emailQueue = new Queue('email-notifications', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const reminderQueue = new Queue('booking-reminders', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  },
});

export const auroraQueue = new Queue('aurora-tasks', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: true,
  },
});

// Job types
export interface EmailJob {
  to: string;
  subject: string;
  template: 'booking-confirmation' | 'booking-reminder' | 'booking-cancelled' | 'voucher';
  data: any;
  locale: string;
}

export interface ReminderJob {
  bookingId: string;
  type: '48h' | '24h';
  customerId: string;
  channel: 'email' | 'whatsapp';
}

export interface AuroraJob {
  type: 'process-message' | 'create-booking' | 'send-reminder' | 'self-evaluation';
  data: any;
}

// Helper functions to add jobs
export async function sendEmail(job: EmailJob, delay?: number) {
  return emailQueue.add(job, { delay });
}

export async function scheduleReminder(job: ReminderJob, scheduledTime: Date) {
  const delay = scheduledTime.getTime() - Date.now();
  return reminderQueue.add(job, { delay: Math.max(0, delay) });
}

export async function addAuroraTask(job: AuroraJob, priority?: number) {
  return auroraQueue.add(job, { priority });
}

// Export queues for worker processing
export const queues = {
  email: emailQueue,
  reminder: reminderQueue,
  aurora: auroraQueue,
};
