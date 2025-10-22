import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userType = user.role === 'guide' ? 'guide' : 'staff';
    const notifications = await getNotifications(user.userId, userType);

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      const userType = user.role === 'guide' ? 'guide' : 'staff';
      await markAllNotificationsAsRead(user.userId, userType);
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      await markNotificationAsRead(notificationId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
