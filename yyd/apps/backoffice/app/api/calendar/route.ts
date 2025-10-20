import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('start');
    const endDateStr = searchParams.get('end');

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'start and end dates required' }, { status: 400 });
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['confirmed', 'pending'] },
      },
      include: {
        product: {
          select: {
            slug: true,
            titlePt: true,
            titleEn: true,
            durationHours: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        guide: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Transform to calendar events format
    const events = bookings.map((booking) => {
      // Combine date with startTime to get accurate start datetime
      const bookingDate = new Date(booking.date);
      const [hours, minutes] = booking.startTime.split(':').map(Number);
      bookingDate.setHours(hours, minutes, 0, 0);
      
      // Calculate end time based on duration
      const endDate = new Date(bookingDate.getTime() + booking.product.durationHours * 60 * 60 * 1000);
      
      return {
        id: booking.id,
        title: `${booking.product.titlePt} - ${booking.customer.name}`,
        start: bookingDate.toISOString(),
        end: endDate.toISOString(),
        backgroundColor: booking.status === 'confirmed' ? '#37C8C4' : '#E9C46A',
        borderColor: booking.status === 'confirmed' ? '#2eb3af' : '#ddb860',
        extendedProps: {
          bookingId: booking.id,
          status: booking.status,
          customerName: booking.customer.name,
          customerEmail: booking.customer.email,
          customerPhone: booking.customer.phone,
          numberOfPeople: booking.numberOfPeople,
          tourName: booking.product.titlePt,
          guideName: booking.guide?.name || null,
          priceEur: booking.priceEur,
          startTime: booking.startTime,
        },
      };
    });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
