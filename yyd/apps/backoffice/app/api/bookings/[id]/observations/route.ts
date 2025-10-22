import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { guideId, observations } = body;

    if (!guideId) {
      return NextResponse.json({ error: 'guideId is required' }, { status: 400 });
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
        guideObservations: observations || null,
      },
    });

    console.log(`✅ Observations updated for booking ${params.id}`);

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error('Error updating observations:', error);
    return NextResponse.json({ error: error.message || 'Failed to update observations' }, { status: 500 });
  }
}
