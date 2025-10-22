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
        { error: 'Guia não possui conta Stripe Connect' },
        { status: 400 }
      );
    }
    
    // Gerar link de login para o dashboard do guia
    const loginLink = await stripe.accounts.createLoginLink(
      guide.stripeConnectedAccountId
    );
    
    return NextResponse.json({
      success: true,
      url: loginLink.url,
      message: 'Link gerado com sucesso. Abrirá o dashboard do guia.',
    });
    
  } catch (error: any) {
    console.error('Erro ao gerar login link:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar link' },
      { status: 500 }
    );
  }
}
