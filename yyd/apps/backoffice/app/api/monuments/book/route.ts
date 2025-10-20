import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

// POST /api/monuments/book - Book monument tickets through external provider
export async function POST(request: NextRequest) {
  try {
    requirePermission(request, 'bookings', 'update');
    const body = await request.json();
    const { bookingId, monumentId, date, numberOfTickets, provider } = body;

    if (!bookingId || !monumentId || !date || !numberOfTickets || !provider) {
      return NextResponse.json(
        { error: 'bookingId, monumentId, date, numberOfTickets, and provider are required' },
        { status: 400 }
      );
    }

    // Fetch booking to get customer details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        product: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check availability first
    const availability = await prisma.monumentTicketAvailability.findFirst({
      where: {
        monumentId,
        date: new Date(date),
        provider,
      },
    });

    if (!availability || !availability.available || availability.remainingSlots < numberOfTickets) {
      return NextResponse.json(
        { error: 'Insufficient availability for requested tickets' },
        { status: 400 }
      );
    }

    // Book tickets through external provider
    const externalBooking = await bookMonumentTickets({
      monumentId,
      date,
      numberOfTickets,
      provider,
      customerName: booking.customer.name,
      customerEmail: booking.customer.email,
    });

    // Create monument ticket record
    const monumentTicket = await prisma.monumentTicket.create({
      data: {
        bookingId,
        monumentId,
        provider,
        numberOfTickets,
        visitDate: new Date(date),
        priceEur: availability.priceEur * numberOfTickets,
        status: 'confirmed',
        externalBookingReference: externalBooking.reference,
        rawResponse: externalBooking.raw,
      },
    });

    // Update availability cache
    await prisma.monumentTicketAvailability.update({
      where: { id: availability.id },
      data: {
        remainingSlots: availability.remainingSlots - numberOfTickets,
      },
    });

    return NextResponse.json(monumentTicket);
  } catch (error: any) {
    console.error('Monument book error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Book tickets through external provider
async function bookMonumentTickets(params: {
  monumentId: string;
  date: string;
  numberOfTickets: number;
  provider: string;
  customerName: string;
  customerEmail: string;
}): Promise<{
  reference: string;
  raw: any;
}> {
  // TODO: Implement actual API calls to monument providers
  // Example:
  // - POST https://api.getyourguide.com/bookings
  // - POST https://api.tiqets.com/v1/bookings
  // etc.

  console.log('Booking monument tickets:', params);

  // Mock response (replace with real API calls)
  const mockReference = `${params.provider.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    reference: mockReference,
    raw: {
      provider: params.provider,
      monumentId: params.monumentId,
      tickets: params.numberOfTickets,
      date: params.date,
      customer: {
        name: params.customerName,
        email: params.customerEmail,
      },
      timestamp: new Date().toISOString(),
    },
  };
}
