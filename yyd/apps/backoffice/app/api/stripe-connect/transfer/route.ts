import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { sendPaymentNotifications } from '@/lib/payment-notifications';
import { logCRUD } from '@/lib/audit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🔵 [PAYROLL STRIPE TRANSFER] Request initiated');
  
  try {
    const user = requirePermission(request, 'finance', 'create');
    console.log(`✅ [AUTH] User ${user.email} authorized for payroll payment`);
    
    const { payrollId } = await request.json();
    console.log(`📥 [REQUEST] Processing payroll: ${payrollId}`);
    
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
    
    // Create transfer
    const amountEur = parseFloat(payroll.netAmount.toString());
    console.log(`💸 [STRIPE] Creating payroll transfer of €${amountEur} to ${stripeAccountId}`);
    
    const transfer = await stripe.transfers.create({
      amount: Math.round(amountEur * 100),
      currency: 'eur',
      destination: stripeAccountId,
      description: `Pagamento ${beneficiaryName} - ${payroll.period}`,
      metadata: {
        payroll_id: payroll.id,
        beneficiary_id: beneficiaryId,
        beneficiary_name: beneficiaryName,
        beneficiary_type: beneficiaryType,
        period: payroll.period,
        initiated_by: user.email,
        initiated_at: new Date().toISOString(),
      },
    });
    
    console.log(`✅ [STRIPE] Transfer successful: ${transfer.id}`);
    
    // Update payroll
    await prisma.payroll.update({
      where: { id: payrollId },
      data: {
        status: 'paid',
        paidAt: new Date(),
        paymentMethod: 'stripe_connect',
        stripeTransferId: transfer.id,
      },
    });
    
    // Log to audit trail
    await logCRUD(
      user.userId,
      user.email,
      'update',
      'payroll',
      payrollId,
      {
        before: { status: payroll.status },
        after: { 
          status: 'paid',
          stripeTransferId: transfer.id,
          beneficiaryName,
          amount: amountEur,
        }
      },
      request
    );

    // Send payment notification emails (beneficiary + finance dept)
    try {
      await sendPaymentNotifications({ payrollId });
      console.log('✅ [EMAIL] Payment notifications sent');
    } catch (emailError) {
      console.error('❌ [EMAIL] Error sending payment notification emails:', emailError);
      // Don't fail the transfer if email notification fails
    }
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  [PERFORMANCE] Payroll payment completed in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: transfer.amount / 100,
      currency: transfer.currency.toUpperCase(),
      destination: transfer.destination,
      message: `Transferência de €${(transfer.amount / 100).toFixed(2)} realizada com sucesso!`,
    });
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [ERROR] Payroll transfer failed after ${duration}ms:`, {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao processar pagamento',
        code: error.code,
        type: error.type,
      },
      { status: 500 }
    );
  }
}
