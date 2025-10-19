import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, amount_eur, status = 'paid' } = body;

    const receivable = await prisma.accountsReceivable.create({
      data: {
        customerId: `booking-${booking_id}`,
        amount: amount_eur,
        dueDate: new Date(),
        status: status
      }
    });

    console.log(`💰 Payment reconciled: €${amount_eur} - ${status}`);

    return NextResponse.json({ success: true, receivable });
  } catch (error) {
    console.error('Reconcile error:', error);
    return NextResponse.json({ error: 'Failed to reconcile payment' }, { status: 500 });
  }
}
