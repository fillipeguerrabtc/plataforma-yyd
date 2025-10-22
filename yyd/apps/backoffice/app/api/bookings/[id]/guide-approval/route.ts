import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { canRejectTour, getHoursUntilTour } from '@/lib/tour-auto-approval';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'guide') {
      return NextResponse.json({ error: 'Forbidden: Only guides can approve bookings' }, { status: 403 });
    }

    const guideId = user.userId;

    const guide = await prisma.guide.findUnique({
      where: { id: guideId },
      select: { active: true },
    });

    if (!guide || !guide.active) {
      return NextResponse.json({ error: 'Forbidden: Guide account is not active' }, { status: 403 });
    }

    const body = await req.json();
    const { status, observations } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'status must be "approved" or "rejected"' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.guideId !== guideId) {
      return NextResponse.json({ error: 'This booking is not assigned to you' }, { status: 403 });
    }

    if (booking.guideApprovalStatus === 'approved' || booking.guideApprovalStatus === 'rejected') {
      return NextResponse.json(
        { error: 'This booking has already been processed' },
        { status: 400 }
      );
    }

    // Validate 48-hour rule for rejections
    if (status === 'rejected') {
      const canReject = canRejectTour(booking.date);
      if (!canReject) {
        const hoursRemaining = getHoursUntilTour(booking.date);
        return NextResponse.json(
          {
            error: `Cannot reject tour less than 48 hours before start time. Tour is in ${hoursRemaining.toFixed(1)} hours.`,
            hoursRemaining,
          },
          { status: 400 }
        );
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        guideApprovalStatus: status,
        guideApprovedAt: new Date(),
        guideObservations: observations || null,
      },
    });

    console.log(`✅ Booking ${params.id} ${status} by guide ${guideId}`);

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error('Error updating guide approval:', error);
    return NextResponse.json({ error: error.message || 'Failed to update guide approval' }, { status: 500 });
  }
}
