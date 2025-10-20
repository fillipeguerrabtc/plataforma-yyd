import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'settings', 'manage');

    const integration = await prisma.integration.findUnique({
      where: { id: params.id },
    });

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    let testResult: any = {
      success: false,
      message: '',
      details: {},
    };

    switch (integration.kind) {
      case 'stripe':
        testResult = await testStripeConnection();
        break;
      case 'whatsapp':
        testResult = await testWhatsAppConnection(integration.config);
        break;
      case 'facebook':
        testResult = await testFacebookConnection(integration.config);
        break;
      case 'email':
        testResult = await testEmailConnection(integration.config);
        break;
      case 'openai':
        testResult = await testOpenAIConnection();
        break;
      default:
        testResult = {
          success: false,
          message: `Test not implemented for integration kind: ${integration.kind}`,
        };
    }

    await logCRUD(
      user.userId,
      user.email,
      'read',
      'integration_test',
      integration.id,
      { after: { kind: integration.kind, success: testResult.success, message: testResult.message } },
      request
    );

    return NextResponse.json(testResult);
  } catch (error: any) {
    console.error('Integration test error:', error);
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}

async function testStripeConnection() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeKey) {
      return {
        success: false,
        message: 'STRIPE_SECRET_KEY not configured',
      };
    }

    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: 'Stripe API authentication failed',
        details: { status: response.status },
      };
    }

    const balance = await response.json();

    return {
      success: true,
      message: 'Stripe connection successful',
      details: {
        available: balance.available,
        pending: balance.pending,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Stripe test failed: ${error.message}`,
    };
  }
}

async function testWhatsAppConnection(config: any) {
  try {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      return {
        success: false,
        message: 'WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured',
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/v17.0/${phoneNumberId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: 'WhatsApp API authentication failed',
        details: { status: response.status },
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: 'WhatsApp connection successful',
      details: {
        phoneNumber: data.display_phone_number,
        verifiedName: data.verified_name,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `WhatsApp test failed: ${error.message}`,
    };
  }
}

async function testFacebookConnection(config: any) {
  try {
    const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;

    if (!token || !pageId) {
      return {
        success: false,
        message: 'FACEBOOK_PAGE_ACCESS_TOKEN or FACEBOOK_PAGE_ID not configured',
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/v17.0/${pageId}?fields=name,verification_status&access_token=${token}`
    );

    if (!response.ok) {
      return {
        success: false,
        message: 'Facebook API authentication failed',
        details: { status: response.status },
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: 'Facebook connection successful',
      details: {
        pageName: data.name,
        verificationStatus: data.verification_status,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Facebook test failed: ${error.message}`,
    };
  }
}

async function testEmailConnection(config: any) {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;

    if (!smtpHost || !smtpUser) {
      return {
        success: false,
        message: 'SMTP_HOST or SMTP_USER not configured',
      };
    }

    return {
      success: true,
      message: 'Email configuration present (SMTP test requires nodemailer)',
      details: {
        host: smtpHost,
        user: smtpUser,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Email test failed: ${error.message}`,
    };
  }
}

async function testOpenAIConnection() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        message: 'OPENAI_API_KEY not configured',
      };
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: 'OpenAI API authentication failed',
        details: { status: response.status },
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: 'OpenAI connection successful',
      details: {
        modelsAvailable: data.data?.length || 0,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `OpenAI test failed: ${error.message}`,
    };
  }
}
