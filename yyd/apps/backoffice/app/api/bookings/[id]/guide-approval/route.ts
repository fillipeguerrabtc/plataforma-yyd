import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

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
