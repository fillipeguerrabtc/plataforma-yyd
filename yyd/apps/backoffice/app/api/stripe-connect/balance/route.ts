import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function GET(request: NextRequest) {
  try {
    requireResourceAccess(request, 'people');
    
    const { searchParams } = new URL(request.url);
    const guideId = searchParams.get('guideId');
    
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
    
    // Consultar saldo da conta do guia
    const balance = await stripe.balance.retrieve({
      stripeAccount: guide.stripeConnectedAccountId,
    });
    
    // Formatar resposta
    const available = balance.available.map(b => ({
      amount: b.amount / 100,
      currency: b.currency.toUpperCase(),
    }));
    
    const pending = balance.pending.map(b => ({
      amount: b.amount / 100,
      currency: b.currency.toUpperCase(),
    }));
    
    return NextResponse.json({
      success: true,
      accountId: guide.stripeConnectedAccountId,
      available,
      pending,
      totalAvailable: available.reduce((sum, b) => sum + b.amount, 0),
    });
    
  } catch (error: any) {
    console.error('Erro ao consultar saldo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao consultar saldo' },
      { status: 500 }
    );
  }
}
