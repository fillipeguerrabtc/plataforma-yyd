import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    requirePermission(request, 'finance', 'create');
    
    const { entityType, entityId, amount, description } = await request.json();
    
    if (!entityType || !entityId || !amount) {
      return NextResponse.json({ error: 'Campos obrigatórios: entityType, entityId, amount' }, { status: 400 });
    }
    
    if (amount <= 0) {
      return NextResponse.json({ error: 'Valor deve ser maior que zero' }, { status: 400 });
    }

    // Get entity and stripe account ID
    let entity: any;
    let stripeAccountId = '';
    let beneficiaryName = '';
    let beneficiaryEmail = '';
    
    if (entityType === 'guide') {
      entity = await prisma.guide.findUnique({ where: { id: entityId } });
      if (entity) {
        stripeAccountId = entity.stripeConnectedAccountId || '';
        beneficiaryName = entity.name;
        beneficiaryEmail = entity.email;
      }
    } else if (entityType === 'staff') {
      entity = await prisma.user.findUnique({ where: { id: entityId } });
      if (entity) {
        stripeAccountId = entity.stripeConnectedAccountId || '';
        beneficiaryName = entity.name;
        beneficiaryEmail = entity.email;
      }
    } else if (entityType === 'vendor') {
      entity = await prisma.vendor.findUnique({ where: { id: entityId } });
      if (entity) {
        stripeAccountId = entity.stripeConnectedAccountId || '';
        beneficiaryName = entity.name;
        beneficiaryEmail = entity.email;
      }
    } else {
      return NextResponse.json({ error: 'entityType inválido. Use: guide, staff ou vendor' }, { status: 400 });
    }

    if (!entity) {
      return NextResponse.json({ error: `${entityType} não encontrado` }, { status: 404 });
    }

    if (!stripeAccountId) {
      return NextResponse.json(
        { error: `${beneficiaryName} não possui Stripe Account ID configurado. Adicione o ID manualmente no perfil.` },
        { status: 400 }
      );
    }
    
    // Verificar se a conta existe e está ativa
    try {
      const account = await stripe.accounts.retrieve(stripeAccountId);
      
      if (!account.charges_enabled || !account.payouts_enabled) {
        return NextResponse.json(
          { 
            error: `Conta Stripe de ${beneficiaryName} não está totalmente ativa. Status: ${account.details_submitted ? 'Dados submetidos' : 'Pendente cadastro'}`,
            accountStatus: {
              charges_enabled: account.charges_enabled,
              payouts_enabled: account.payouts_enabled,
              details_submitted: account.details_submitted,
            }
          },
          { status: 400 }
        );
      }
    } catch (accountError: any) {
      return NextResponse.json(
        { error: `Erro ao verificar conta Stripe: ${accountError.message}` },
        { status: 400 }
      );
    }
    
    // Fazer transfer do saldo da plataforma para o beneficiário
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Converter para centavos
      currency: 'eur',
      destination: stripeAccountId,
      description: description || `Pagamento para ${beneficiaryName}`,
      metadata: {
        entity_type: entityType,
        entity_id: entityId,
        beneficiary_name: beneficiaryName,
        beneficiary_email: beneficiaryEmail,
        source: 'backoffice_direct_transfer',
      },
    });
    
    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: transfer.amount / 100,
      currency: transfer.currency.toUpperCase(),
      destination: transfer.destination,
      beneficiary: beneficiaryName,
      createdAt: new Date(transfer.created * 1000).toISOString(),
      message: `✅ Transferência de €${(transfer.amount / 100).toFixed(2)} para ${beneficiaryName} realizada com sucesso!`,
    });
    
  } catch (error: any) {
    console.error('❌ Erro ao fazer transfer:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar transferência' },
      { status: 500 }
    );
  }
}
