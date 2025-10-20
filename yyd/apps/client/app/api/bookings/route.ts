import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerFromRequest } from '@/lib/customer-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Booking request received:', {
      productId: body.productId,
      date: body.date,
      numberOfPeople: body.numberOfPeople,
      hasCustomerId: !!body.customerId,
      hasEmail: !!body.customerEmail,
      season: body.season
    });
    
    const {
      productId,
      date,
      startTime,
      numberOfPeople,
      selectedActivities,
      pickupLocation,
      specialRequests,
      customerName,
      customerEmail,
      customerPhone,
      customerLocale,
      customerId: providedCustomerId, // Frontend may send this
      addons, // Frontend sends add-ons
      season, // Frontend sends season
    } = body;

    // Check if customer is authenticated
    const auth = getCustomerFromRequest(request);
    
    // Validate required fields
    if (!productId || !date || !numberOfPeople) {
      console.error('❌ Missing required fields:', { productId, date, numberOfPeople });
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // If customerId is provided (frontend created customer), use it
    // Otherwise require customerName and customerEmail
    if (!auth && !providedCustomerId && (!customerName || !customerEmail)) {
      console.error('❌ Missing customer info:', { 
        isAuth: !!auth, 
        hasCustomerId: !!providedCustomerId, 
        hasName: !!customerName, 
        hasEmail: !!customerEmail 
      });
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios para reservas' },
        { status: 400 }
      );
    }

    // Fetch product with pricing to recalculate server-side
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seasonPrices: true,
      },
    });

    if (!product || !product.active) {
      return NextResponse.json({ error: 'Tour não disponível' }, { status: 404 });
    }

    // CRITICAL: Calculate price server-side (never trust client)
    const bookingDate = new Date(date);
    const month = bookingDate.getMonth() + 1;

    let priceEur = 100; // Default fallback
    const applicablePrices = product.seasonPrices.filter(
      (sp) =>
        sp.startMonth <= month &&
        sp.endMonth >= month &&
        sp.minPeople <= numberOfPeople &&
        (!sp.maxPeople || sp.maxPeople >= numberOfPeople)
    );

    if (applicablePrices.length > 0) {
      const price = applicablePrices[0];
      priceEur = price.pricePerPerson
        ? parseFloat(price.priceEur.toString()) * numberOfPeople
        : parseFloat(price.priceEur.toString());
    }

    // Determine season (use provided or calculate)
    const bookingSeason = season || (month >= 6 && month <= 9 ? 'peak' : 'high');

    // Get or create customer
    let customerId: string;
    
    if (auth) {
      // Use authenticated customer
      customerId = auth.customerId;
    } else if (providedCustomerId) {
      // Use customer ID provided by frontend
      customerId = providedCustomerId;
    } else {
      // Create or find customer
      let customer = await prisma.customer.findUnique({
        where: { email: customerEmail },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: customerName!,
            email: customerEmail!,
            phone: customerPhone || null,
            locale: customerLocale || 'en',
            source: 'website',
          },
        });
      }
      
      customerId = customer.id;
    }

    // Generate booking number
    const bookingNumber = `YYD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId,
        productId,
        date: bookingDate,
        startTime: startTime || '09:00',
        numberOfPeople,
        pickupLocation: pickupLocation || '',
        specialRequests: specialRequests || null,
        selectedActivities: selectedActivities || [],
        priceEur,
        season: bookingSeason,
        status: 'pending',
        locale: customerLocale || 'en',
      },
      include: {
        customer: true,
        product: true,
      },
    });

    console.log('✅ Booking created successfully:', booking.id);
    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error('❌ ERROR creating booking:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to create booking: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = getCustomerFromRequest(request);
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (bookingId) {
      // CRITICAL: Must be authenticated to view booking details
      if (!auth) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          product: true,
          payments: true,
        },
      });

      if (!booking) {
        return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
      }

      // CRITICAL: Verify ownership - customer can only see their own bookings
      if (booking.customerId !== auth.customerId) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
      }

      return NextResponse.json(booking);
    }

    // List bookings for authenticated customer
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { customerId: auth.customerId },
      include: {
        product: true,
        payments: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reservas: ' + error.message },
      { status: 500 }
    );
  }
}
