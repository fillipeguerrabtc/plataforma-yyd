import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId,
      date,
      numberOfPeople,
      selectedActivities,
      selectedOptions,
      specialRequests,
      customerName,
      customerEmail,
      customerPhone,
      customerLocale,
      preferredContact,
    } = body;

    // Validate required fields
    if (!productId || !date || !numberOfPeople || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch product with pricing to recalculate server-side
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seasonPrices: true,
        options: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // CRITICAL: Recalculate price server-side (never trust client)
    const { calculatePrice } = await import('@yyd/shared');
    const tiers = product.seasonPrices.map((sp) => ({
      season: sp.season as 'low' | 'high',
      tier: sp.tier,
      minPeople: sp.minPeople,
      maxPeople: sp.maxPeople,
      priceEur: parseFloat(sp.priceEur.toString()),
      pricePerPerson: sp.pricePerPerson,
    }));

    const basePrice = calculatePrice(tiers, numberOfPeople, new Date(date));
    
    if (!basePrice) {
      return NextResponse.json({ error: 'Invalid pricing tier' }, { status: 400 });
    }

    // Calculate options price
    const optionsPrice = selectedOptions.reduce((sum: number, optionId: string) => {
      const option = product.options.find((o) => o.id === optionId);
      return sum + (option ? parseFloat(option.priceEur.toString()) : 0);
    }, 0);

    const totalPrice = basePrice + optionsPrice;

    // Create or find customer
    let customer = await prisma.customer.findUnique({
      where: { email: customerEmail },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          locale: customerLocale,
        },
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        productId,
        date: new Date(date),
        numberOfPeople,
        status: 'pending_payment',
        totalPriceEur: totalPrice,
        specialRequests,
        metadata: {
          selectedActivities,
          selectedOptions,
          preferredContact,
        },
      },
      include: {
        customer: true,
        product: true,
      },
    });

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          product: true,
          payment: true,
        },
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      return NextResponse.json(booking);
    }

    // List all bookings (for backoffice)
    const bookings = await prisma.booking.findMany({
      include: {
        customer: true,
        product: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings: ' + error.message },
      { status: 500 }
    );
  }
}
