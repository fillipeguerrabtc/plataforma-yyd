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
    
    if (guide.stripeConnectedAccountId) {
      return NextResponse.json(
        { error: 'Guia já possui conta Stripe Connect' },
        { status: 400 }
      );
    }
    
    // Criar conta Stripe Connect
    const account = await stripe.accounts.create({
      type: 'express', // Tipo mais simples para começar
      country: 'PT',
      email: guide.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        guide_id: guide.id,
        guide_name: guide.name,
      },
    });
    
    // Atualizar guia com ID da conta
    await prisma.guide.update({
      where: { id: guideId },
      data: {
        stripeConnectedAccountId: account.id,
        stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
        stripeAccountType: account.type,
        stripeOnboardingCompleted: account.details_submitted || false,
      },
    });
    
    return NextResponse.json({
      success: true,
      accountId: account.id,
      status: account.charges_enabled ? 'active' : 'pending',
      message: 'Conta Stripe Connect criada com sucesso',
    });
    
  } catch (error: any) {
    console.error('Erro ao criar conta Stripe Connect:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar conta' },
      { status: 500 }
    );
  }
}
