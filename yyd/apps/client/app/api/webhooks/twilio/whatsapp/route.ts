import { NextRequest, NextResponse } from 'next/server';

const AURORA_SERVICE_URL = process.env.AURORA_SERVICE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = `${AURORA_SERVICE_URL}/webhooks/twilio/whatsapp?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Twilio webhook GET proxy error:', error);
    return new NextResponse('Service unavailable', { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    const response = await fetch(`${AURORA_SERVICE_URL}/webhooks/twilio/whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Twilio webhook POST proxy error:', error);
    return new NextResponse('Service unavailable', { status: 503 });
  }
}
