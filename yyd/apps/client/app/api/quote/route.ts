import { NextRequest, NextResponse } from 'next/server';
import { reason } from '@yyd/proxy-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, tour_id, date, seats } = body;

    const result = await reason('quote_price', {
      customer_id,
      tour_id,
      date,
      seats
    });

    const price_eur = result.params?.price_eur || 100 + (seats * 50);

    return NextResponse.json({ price_eur });
  } catch (error) {
    console.error('Quote error:', error);
    return NextResponse.json({ price_eur: 150 }, { status: 200 });
  }
}
