import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user || user.userType !== 'guide') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        guideId: user.userId,
        date: { gte: new Date() },
      },
      include: {
        product: true,
        customer: true,
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Failed to fetch guide tours:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
