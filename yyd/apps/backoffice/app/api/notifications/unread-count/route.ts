import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getUnreadNotificationCount } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userType = user.role === 'guide' ? 'guide' : 'staff';
    const count = await getUnreadNotificationCount(user.userId, userType);

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
