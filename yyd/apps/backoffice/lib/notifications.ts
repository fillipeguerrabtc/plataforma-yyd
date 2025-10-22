import { prisma } from './prisma';

export type NotificationType = 
  | 'tour_assigned'
  | 'tour_approved'
  | 'tour_rejected'
  | 'payment_received'
  | 'payment_sent'
  | 'booking_created'
  | 'booking_cancelled';

interface CreateNotificationParams {
  userId: string;
  userType: 'guide' | 'staff';
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        userType: params.userType,
        type: params.type,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl || null,
        metadata: params.metadata || null,
      },
    });

    console.log(`✅ Notification created for ${params.userType} ${params.userId}: ${params.title}`);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
}

export async function getNotifications(userId: string, userType: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      userType,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markNotificationAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

export async function markAllNotificationsAsRead(userId: string, userType: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      userType,
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

export async function getUnreadNotificationCount(userId: string, userType: string) {
  return prisma.notification.count({
    where: {
      userId,
      userType,
      read: false,
    },
  });
}
