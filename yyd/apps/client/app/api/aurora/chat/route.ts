/**
 * Aurora Chat Proxy API
 * 
 * Proxies chat requests to Aurora FastAPI service
 * Uses environment variable for Aurora URL
 */

import { NextRequest, NextResponse } from 'next/server';

const AURORA_URL = process.env.AURORA_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, language = 'en' } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Forward to Aurora FastAPI service
    const auroraResponse = await fetch(`${AURORA_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sessionId: sessionId || `web-${Date.now()}`,
        language,
      }),
    });

    if (!auroraResponse.ok) {
      throw new Error(`Aurora service error: ${auroraResponse.status}`);
    }

    const data = await auroraResponse.json();

    return NextResponse.json({
      success: true,
      response: data.response,
      affectiveState: data.affectiveState,
      suggestedActions: data.suggestedActions,
    });

  } catch (error: any) {
    console.error('❌ Aurora proxy error:', error);
    
    // Fallback response if Aurora is down
    return NextResponse.json({
      success: false,
      response: 'I\'m currently offline. Please contact us via WhatsApp at +351 XXX XXX XXX or email info@yesyoudeserve.tours',
      error: error.message,
    });
  }
}
