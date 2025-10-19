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

    return NextResponse.json({
      price_eur: result.params?.price_eur || 100,
      risk: result.params?.risk || 0
    });
  } catch (error) {
    console.error('Quote error:', error);
    return NextResponse.json({ error: 'Failed to get quote' }, { status: 500 });
  }
}
