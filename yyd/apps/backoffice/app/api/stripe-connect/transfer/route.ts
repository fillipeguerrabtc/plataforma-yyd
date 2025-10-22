import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { sendPaymentNotifications } from '@/lib/payment-notifications';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    requirePermission(request, 'finance', 'create');
    
    const { payrollId } = await request.json();
    
    if (!payrollId) {
      return NextResponse.json({ error: 'payrollId é obrigatório' }, { status: 400 });
    }
    
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        guide: true,
        staff: true,
        vendor: true,
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

    // Detect beneficiary type and get Stripe account ID
    let stripeAccountId = '';
    let beneficiaryName = '';
    let beneficiaryId = '';
    let beneficiaryType = '';

    if (payroll.guide) {
      stripeAccountId = payroll.guide.stripeConnectedAccountId || '';
      beneficiaryName = payroll.guide.name;
      beneficiaryId = payroll.guide.id;
      beneficiaryType = 'guide';
    } else if (payroll.staff) {
      stripeAccountId = payroll.staff.stripeConnectedAccountId || '';
      beneficiaryName = payroll.staff.name;
      beneficiaryId = payroll.staff.id;
      beneficiaryType = 'staff';
    } else if (payroll.vendor) {
      stripeAccountId = payroll.vendor.stripeConnectedAccountId || '';
      beneficiaryName = payroll.vendor.name;
      beneficiaryId = payroll.vendor.id;
      beneficiaryType = 'vendor';
    } else {
      return NextResponse.json(
        { error: 'Payroll não possui beneficiário associado (guide/staff/vendor)' },
        { status: 400 }
      );
    }

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: `${beneficiaryType} não possui conta Stripe Connect configurada` },
        { status: 400 }
      );
    }
    
    // Verificar se a conta está ativa
    const account = await stripe.accounts.retrieve(stripeAccountId);
    
    if (!account.charges_enabled || !account.payouts_enabled) {
      return NextResponse.json(
        { 
          error: `Conta Stripe do ${beneficiaryType} não está ativa. É necessário completar o onboarding primeiro.`,
          accountStatus: {
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
          }
        },
        { status: 400 }
      );
    }
    
    // Fazer transfer do saldo da plataforma para o saldo do beneficiário
    const transfer = await stripe.transfers.create({
      amount: Math.round(parseFloat(payroll.netAmount.toString()) * 100), // Converter para centavos
      currency: 'eur',
      destination: stripeAccountId,
      description: `Pagamento ${beneficiaryName} - ${payroll.period}`,
      metadata: {
        payroll_id: payroll.id,
        beneficiary_id: beneficiaryId,
        beneficiary_name: beneficiaryName,
        beneficiary_type: beneficiaryType,
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

    // Send payment notification emails (beneficiary + finance dept)
    try {
      await sendPaymentNotifications({ payrollId });
    } catch (emailError) {
      console.error('❌ Error sending payment notification emails:', emailError);
      // Don't fail the transfer if email notification fails
    }
    
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
