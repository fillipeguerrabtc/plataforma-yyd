import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    requireResourceAccess(request, 'guides');
    
    const { guideId } = await request.json();
    
    if (!guideId) {
      return NextResponse.json({ error: 'guideId é obrigatório' }, { status: 400 });
    }
    
    const guide = await prisma.guide.findUnique({
      where: { id: guideId },
    });
    
    if (!guide) {
      return NextResponse.json({ error: 'Guia não encontrado' }, { status: 404 });
    }
    
    if (!guide.stripeConnectedAccountId) {
      return NextResponse.json(
        { error: 'Guia não possui conta Stripe Connect. Crie uma primeiro.' },
        { status: 400 }
      );
    }
    
    // Gerar Account Link para onboarding
    const accountLink = await stripe.accountLinks.create({
      account: guide.stripeConnectedAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3001'}/people/guides`,
      return_url: `${process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3001'}/people/guides?onboarding=success`,
      type: 'account_onboarding',
    });
    
    return NextResponse.json({
      success: true,
      url: accountLink.url,
      message: 'Link de onboarding gerado. O guia deve completar o cadastro para receber pagamentos.',
    });
    
  } catch (error: any) {
    console.error('Erro ao gerar onboarding link:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar link' },
      { status: 500 }
    );
  }
}
