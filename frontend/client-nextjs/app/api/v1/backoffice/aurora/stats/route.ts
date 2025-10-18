import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_URL}/api/v1/backoffice/aurora/stats`, {
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Aurora stats API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Aurora stats' }, { status: 500 });
  }
}
