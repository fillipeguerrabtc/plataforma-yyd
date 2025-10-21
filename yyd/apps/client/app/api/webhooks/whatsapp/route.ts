import { NextResponse } from 'next/server';

const AURORA_SERVICE_URL = process.env.AURORA_SERVICE_URL || 'http://localhost:8008';

/**
 * WhatsApp Business API Webhook - Proxies to Aurora IA FastAPI Service
 * 
 * This endpoint forwards WhatsApp webhook requests to Aurora's advanced IA system
 * which includes RAG, 7-layer memory, affective mathematics, and handoff detection.
 */

// Webhook verification (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Forward verification request to Aurora FastAPI
  const queryString = searchParams.toString();
  const auroraUrl = `${AURORA_SERVICE_URL}/webhooks/whatsapp?${queryString}`;

  try {
    const response = await fetch(auroraUrl);
    
    if (response.ok) {
      const challenge = await response.text();
      console.log('✅ WhatsApp webhook verified via Aurora');
      return new Response(challenge, { status: 200 });
    }
    
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  } catch (error: any) {
    console.error('❌ Aurora service connection error:', error);
    return NextResponse.json({ error: 'Aurora service unavailable' }, { status: 503 });
  }
}

// Webhook message handler (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('📥 WhatsApp webhook received, forwarding to Aurora...');

    // Forward to Aurora FastAPI for processing
    const auroraUrl = `${AURORA_SERVICE_URL}/webhooks/whatsapp`;
    const response = await fetch(auroraUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      console.log('✅ WhatsApp message processed by Aurora');
      return NextResponse.json({ status: 'success' });
    } else {
      const error = await response.text();
      console.error('❌ Aurora processing error:', error);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ WhatsApp webhook proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
