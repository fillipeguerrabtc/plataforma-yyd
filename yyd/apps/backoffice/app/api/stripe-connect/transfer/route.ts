import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    requireResourceAccess(request, 'finance');
    
    const { payrollId } = await request.json();
    
    if (!payrollId) {
      return NextResponse.json({ error: 'payrollId é obrigatório' }, { status: 400 });
    }
    
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        guide: true,
      },
    });
    
    if (!payroll) {
      return NextResponse.json({ error: 'Payroll não encontrado' }, { status: 404 });
    }
    
    if (payroll.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payroll já foi processado' },
        { status: 400 }
      );
    }
    
    if (!payroll.guide) {
      return NextResponse.json(
        { error: 'Payroll não possui guia associado' },
        { status: 400 }
      );
    }
    
    if (!payroll.guide.stripeConnectedAccountId) {
      return NextResponse.json(
        { error: 'Guia não possui conta Stripe Connect' },
        { status: 400 }
      );
    }
    
    // Verificar se a conta do guia está ativa
    const account = await stripe.accounts.retrieve(payroll.guide.stripeConnectedAccountId);
    
    if (!account.charges_enabled || !account.payouts_enabled) {
      return NextResponse.json(
        { 
          error: 'Conta do guia não está ativa. O guia precisa completar o onboarding primeiro.',
          accountStatus: {
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
          }
        },
        { status: 400 }
      );
    }
    
    // Fazer transfer do seu saldo para o saldo do guia
    const transfer = await stripe.transfers.create({
      amount: Math.round(parseFloat(payroll.netAmount.toString()) * 100), // Converter para centavos
      currency: 'eur',
      destination: payroll.guide.stripeConnectedAccountId,
      description: `Salário ${payroll.guide.name} - ${payroll.period}`,
      metadata: {
        payroll_id: payroll.id,
        guide_id: payroll.guide.id,
        guide_name: payroll.guide.name,
        period: payroll.period,
      },
    });
    
    // Atualizar payroll
    await prisma.payroll.update({
      where: { id: payrollId },
      data: {
        status: 'paid',
        paidAt: new Date(),
        paymentMethod: 'stripe_connect',
        stripeTransferId: transfer.id,
      },
    });
    
    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: transfer.amount / 100,
      currency: transfer.currency.toUpperCase(),
      destination: transfer.destination,
      message: `Transferência de €${(transfer.amount / 100).toFixed(2)} realizada com sucesso!`,
    });
    
  } catch (error: any) {
    console.error('Erro ao fazer transfer:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}
