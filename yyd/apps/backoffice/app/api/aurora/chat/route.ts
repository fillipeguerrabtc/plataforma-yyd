import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';

const AURORA_URL = process.env.AURORA_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    requirePermission(request, 'aurora', 'read');
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { message, sessionId, language = 'en' } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const auroraResponse = await fetch(`${AURORA_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sessionId: sessionId || `backoffice-${Date.now()}`,
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
    console.error('Aurora proxy error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to Aurora service. Make sure Aurora FastAPI is running on port 8000.',
    }, { status: 500 });
  }
}
