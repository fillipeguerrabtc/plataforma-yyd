import { NextResponse } from 'next/server';
import { getAuroraResponse, saveConversation } from '@/lib/aurora';

const FACEBOOK_VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'yyd_fb_verify_2025';
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

// Webhook verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === FACEBOOK_VERIFY_TOKEN) {
    console.log('Facebook webhook verified');
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
    const messaging = entry?.messaging?.[0];
    const message = messaging?.message;

    if (!message || !message.text) {
      return NextResponse.json({ status: 'no_message' });
    }

    const senderId = messaging.sender.id;
    const text = message.text;
    const sessionId = `facebook_${senderId}`;

    // Get Aurora response
    const auroraResponse = await getAuroraResponse(
      [{ role: 'user', content: text }],
      'en' // Default to English
    );

    // Save conversation
    await saveConversation(sessionId, 'facebook', null, 'en', [
      { role: 'user', content: text },
      { role: 'assistant', content: auroraResponse },
    ]);

    // Send response via Facebook
    if (FACEBOOK_PAGE_ACCESS_TOKEN) {
      await sendFacebookMessage(senderId, auroraResponse);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Facebook webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function sendFacebookMessage(recipientId: string, text: string) {
  if (!FACEBOOK_PAGE_ACCESS_TOKEN) {
    console.error('Facebook Page Access Token not configured');
    return;
  }

  const response = await fetch(
    `https://graph.facebook.com/v17.0/me/messages?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
      }),
    }
  );

  if (!response.ok) {
    console.error('Failed to send Facebook message:', await response.text());
  }
}
