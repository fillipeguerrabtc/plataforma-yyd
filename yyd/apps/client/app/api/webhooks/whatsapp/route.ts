import { NextResponse } from 'next/server';
import { getAuroraResponse, saveConversation } from '@/lib/aurora';

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'yyd_verify_token_2025';

// Webhook verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// Webhook message handler
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract message
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: 'no_message' });
    }

    const from = message.from; // Phone number
    const text = message.text?.body || '';
    const sessionId = `whatsapp_${from}`;

    // Get Aurora response
    const auroraResponse = await getAuroraResponse(
      [{ role: 'user', content: text }],
      'en' // Default to English, detect language later
    );

    // Save conversation
    await saveConversation(sessionId, 'whatsapp', null, 'en', [
      { role: 'user', content: text },
      { role: 'assistant', content: auroraResponse },
    ]);

    // Send response via WhatsApp
    if (WHATSAPP_ACCESS_TOKEN) {
      await sendWhatsAppMessage(from, auroraResponse);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function sendWhatsAppMessage(to: string, text: string) {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.error('WhatsApp credentials not configured');
    return;
  }

  const response = await fetch(
    `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    }
  );

  if (!response.ok) {
    console.error('Failed to send WhatsApp message:', await response.text());
  }
}
