import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export async function GET() {
  try {
    // Fetch ACTUAL payments from the payments table, not booking estimates
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            product: true,
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format payment data for frontend
    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      bookingId: payment.bookingId,
      stripePaymentIntentId: payment.stripePaymentIntent || 'N/A',
      amount: parseFloat(payment.amount.toString()),
      currency: payment.currency,
      status: payment.status,
      customerEmail: payment.booking?.customer?.email || 'N/A',
      customerName: payment.booking?.customer?.name || 'N/A',
      productName: payment.booking?.product?.titleEn || 'Unknown',
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt.toISOString(),
      paidAt: payment.paidAt?.toISOString() || null,
    }));

    return NextResponse.json(formattedPayments);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
