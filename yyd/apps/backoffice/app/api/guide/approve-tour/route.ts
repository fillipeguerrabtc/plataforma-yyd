import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user || user.userType !== 'guide') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, action, observations } = await request.json();

    if (!bookingId || !action) {
      return NextResponse.json(
        { error: 'bookingId and action are required' },
        { status: 400 }
      );
    }

    // Verify that this booking belongs to the guide
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.guideId !== user.userId) {
      return NextResponse.json({ error: 'Booking not found or not assigned to you' }, { status: 404 });
    }

    // Update booking approval status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        guideApprovalStatus: action === 'approve' ? 'approved' : 'rejected',
        guideApprovedAt: new Date(),
        guideObservations: observations || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to approve/reject tour:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
