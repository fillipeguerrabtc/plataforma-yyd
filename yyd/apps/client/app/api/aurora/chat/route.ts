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
    console.error('Aurora service URL:', AURORA_URL);
    
    // Try to return a helpful response instead of error
    const { language = 'en' } = await request.json();
    
    const messages: Record<string, string> = {
      en: 'I\'m having a brief connection issue. Let me help you anyway! What would you like to know about our tours?',
      pt: 'Estou com um problema de conexão momentâneo. Mas posso te ajudar mesmo assim! O que gostaria de saber sobre nossos tours?',
      es: 'Tengo un problema de conexión momentáneo. ¡Pero puedo ayudarte de todos modos! ¿Qué te gustaría saber sobre nuestros tours?',
    };
    
    return NextResponse.json({
      success: true,
      response: messages[language] || messages.en,
    });
  }
}
