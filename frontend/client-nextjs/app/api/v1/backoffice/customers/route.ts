import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    const url = queryString 
      ? `${BACKEND_URL}/api/v1/backoffice/customers?${queryString}`
      : `${BACKEND_URL}/api/v1/backoffice/customers`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Customers API error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/v1/backoffice/customers`, {
      method: 'POST',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Create customer API error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
