import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: Request) {
  try {
    const {
      tourId,
      date,
      numberOfPeople,
      startTime,
      customerName,
      customerEmail,
      customerPhone,
      pickupLocation,
      specialRequests,
      totalPriceEur,
    } = await request.json();

    // Validate required fields
    if (!tourId || !date || !numberOfPeople || !customerName || !customerEmail || !totalPriceEur) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get tour details
    const tour = await prisma.product.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    // Create or get customer
    let customer = await prisma.customer.findUnique({
      where: { email: customerEmail },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone || '',
          locale: 'en',
        },
      });
    }

    // Server-side price recalculation for security
    // TODO: Calculate actual price based on season and group size
    const calculatedPrice = totalPriceEur;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: tour.titleEn,
              description: `${tour.categoryEn} - ${date}`,
              images: tour.imageUrls && tour.imageUrls.length > 0 ? [tour.imageUrls[0]] : [],
            },
            unit_amount: Math.round(calculatedPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/booking/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/booking/cancelled`,
      customer_email: customerEmail,
      metadata: {
        tourId,
        customerId: customer.id,
        date,
        numberOfPeople: numberOfPeople.toString(),
        startTime: startTime || '09:00',
        pickupLocation: pickupLocation || '',
        specialRequests: specialRequests || '',
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
