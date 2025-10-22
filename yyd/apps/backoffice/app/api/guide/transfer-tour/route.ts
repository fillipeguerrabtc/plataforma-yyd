import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user || user.userType !== 'guide') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, newGuideId, observations } = await request.json();

    if (!bookingId || !newGuideId) {
      return NextResponse.json(
        { error: 'bookingId and newGuideId are required' },
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

    // Verify that the new guide exists
    const newGuide = await prisma.guide.findUnique({
      where: { id: newGuideId },
    });

    if (!newGuide) {
      return NextResponse.json({ error: 'New guide not found' }, { status: 404 });
    }

    // Transfer the booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        guideId: newGuideId,
        guideApprovalStatus: 'pending',
        guideApprovedAt: null,
        guideObservations: observations || `Transferido de ${user.email}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to transfer tour:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
