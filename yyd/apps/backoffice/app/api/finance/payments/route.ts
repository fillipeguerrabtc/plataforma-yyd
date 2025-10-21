import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
      },
      include: {
        product: true,
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const payments = await Promise.all(
      bookings.map(async (booking) => {
        const totalAmount = parseFloat(booking.priceEur.toString()) + parseFloat(booking.addonsTotal.toString());
        
        return {
          id: booking.id,
          bookingId: booking.id,
          stripePaymentIntentId: 'pi_' + booking.id.slice(0, 24),
          amount: totalAmount,
          currency: 'eur',
          status: booking.status === 'confirmed' ? 'succeeded' : 'pending',
          customerEmail: booking.customer?.email || 'N/A',
          customerName: booking.customer?.name || 'N/A',
          productName: booking.product?.titleEn || 'Unknown',
          paymentMethod: 'card',
          createdAt: booking.createdAt.toISOString(),
          paidAt: booking.confirmedAt?.toISOString() || null,
        };
      })
    );

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
