import { prisma } from './prisma';
import { createNotification } from './notifications';

export async function scheduleAutoApproval(bookingId: string) {
  const scheduledFor = new Date();
  scheduledFor.setHours(scheduledFor.getHours() + 1); // 1 hour from now

  await prisma.scheduledTask.create({
    data: {
      taskType: 'tour_auto_approval',
      entityId: bookingId,
      entityType: 'booking',
      scheduledFor,
      metadata: {
        bookingId,
        createdAt: new Date().toISOString(),
      },
    },
  });

  console.log(`✅ Scheduled auto-approval for booking ${bookingId} at ${scheduledFor.toISOString()}`);
}

export async function executeAutoApproval(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guide: true,
        product: true,
      },
    });

    if (!booking) {
      console.log(`⚠️  Booking ${bookingId} not found for auto-approval`);
      return;
    }

    if (booking.guideApprovalStatus !== 'pending') {
      console.log(`ℹ️  Booking ${bookingId} already ${booking.guideApprovalStatus}, skipping auto-approval`);
      return;
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        guideApprovalStatus: 'approved',
        guideApprovedAt: new Date(),
        guideObservations: 'Auto-aprovado após 1 hora sem resposta',
      },
    });

    if (booking.guide) {
      await createNotification({
        userId: booking.guide.id,
        userType: 'guide',
        type: 'tour_approved',
        title: 'Tour Auto-Aprovado',
        message: `O tour "${booking.product?.titlePt || 'Tour'}" foi automaticamente aprovado após 1 hora sem resposta.`,
        actionUrl: `/bookings/${bookingId}`,
      });
    }

    console.log(`✅ Booking ${bookingId} auto-approved after 1 hour`);
  } catch (error) {
    console.error(`❌ Error auto-approving booking ${bookingId}:`, error);
    throw error;
  }
}

export function canRejectTour(tourDate: Date): boolean {
  const now = new Date();
  const hoursUntilTour = (tourDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilTour >= 48;
}

export function getHoursUntilTour(tourDate: Date): number {
  const now = new Date();
  return (tourDate.getTime() - now.getTime()) / (1000 * 60 * 60);
}
