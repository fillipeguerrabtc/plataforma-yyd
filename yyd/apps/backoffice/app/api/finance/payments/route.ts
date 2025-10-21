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
        stripePaymentIntentId: {
          not: null,
        },
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
        let paymentStatus = 'pending';
        let paymentMethod = 'card';
        let paidAt = null;

        if (booking.stripePaymentIntentId) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(
              booking.stripePaymentIntentId
            );
            paymentStatus = paymentIntent.status;
            
            if (paymentIntent.charges.data.length > 0) {
              const charge = paymentIntent.charges.data[0];
              paymentMethod = charge.payment_method_details?.type || 'card';
              if (charge.paid) {
                paidAt = new Date(charge.created * 1000).toISOString();
              }
            }
          } catch (error) {
            console.error('Error fetching payment intent:', error);
          }
        }

        return {
          id: booking.id,
          bookingId: booking.id,
          stripePaymentIntentId: booking.stripePaymentIntentId || '',
          amount: parseFloat(booking.totalPriceEur?.toString() || '0'),
          currency: 'eur',
          status: paymentStatus,
          customerEmail: booking.customerEmail,
          customerName: booking.customerName,
          productName: booking.product?.titleEn || 'Unknown',
          paymentMethod,
          createdAt: booking.createdAt.toISOString(),
          paidAt,
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
