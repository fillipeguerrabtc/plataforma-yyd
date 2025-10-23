import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🔵 [STRIPE TRANSFER] Request initiated');
  
  try {
    // Permission check with user data
    const user = requirePermission(request, 'finance', 'create');
    console.log(`✅ [AUTH] User ${user.email} authorized for finance.create`);
    
    const body = await request.json();
    console.log('📥 [REQUEST] Payload received:', JSON.stringify(body, null, 2));
    const { entityType, entityId, amount, description } = body;
    
    // Enhanced validation
    if (!entityType || !entityId || !amount) {
      console.log('❌ [VALIDATION] Missing required fields');
      return NextResponse.json({ 
        error: 'Campos obrigatórios: entityType, entityId, amount',
        details: { entityType: !!entityType, entityId: !!entityId, amount: !!amount }
      }, { status: 400 });
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.log(`❌ [VALIDATION] Invalid amount: ${amount}`);
      return NextResponse.json({ error: 'Valor deve ser um número positivo válido' }, { status: 400 });
    }

    if (amountNum > 100000) {
      console.log(`⚠️  [VALIDATION] Large amount detected: €${amountNum}`);
      return NextResponse.json({ 
        error: 'Valor muito alto. Para transferências acima de €100.000, contate o suporte.' 
      }, { status: 400 });
    }

    if (!['guide', 'staff', 'vendor'].includes(entityType)) {
      console.log(`❌ [VALIDATION] Invalid entityType: ${entityType}`);
      return NextResponse.json({ error: 'entityType inválido. Use: guide, staff ou vendor' }, { status: 400 });
    }

    // Get entity and stripe account ID
    console.log(`🔍 Buscando ${entityType} com ID: ${entityId}`);
    let entity: any;
    let stripeAccountId = '';
    let beneficiaryName = '';
    let beneficiaryEmail = '';
    
    if (entityType === 'guide') {
      entity = await prisma.guide.findUnique({ where: { id: entityId } });
      console.log('📊 Guide found:', entity ? 'SIM' : 'NÃO');
      if (entity) {
        stripeAccountId = entity.stripeConnectedAccountId || '';
        beneficiaryName = entity.name;
        beneficiaryEmail = entity.email;
      }
    } else if (entityType === 'staff') {
      entity = await prisma.user.findUnique({ where: { id: entityId } });
      console.log('📊 Staff (User) found:', entity ? 'SIM' : 'NÃO');
      console.log('📊 Entity details:', entity ? { id: entity.id, name: entity.name, stripeId: entity.stripeConnectedAccountId } : 'NULL');
      if (entity) {
        stripeAccountId = entity.stripeConnectedAccountId || '';
        beneficiaryName = entity.name;
        beneficiaryEmail = entity.email;
      }
    } else if (entityType === 'vendor') {
      entity = await prisma.vendor.findUnique({ where: { id: entityId } });
      console.log('📊 Vendor found:', entity ? 'SIM' : 'NÃO');
      if (entity) {
        stripeAccountId = entity.stripeConnectedAccountId || '';
        beneficiaryName = entity.name;
        beneficiaryEmail = entity.email;
      }
    } else {
      console.log('❌ entityType inválido:', entityType);
      return NextResponse.json({ error: 'entityType inválido. Use: guide, staff ou vendor' }, { status: 400 });
    }

    console.log(`🔍 Resultado da busca: entity=${entity ? 'encontrado' : 'NÃO encontrado'}, stripeAccountId=${stripeAccountId}`);
    
    if (!entity) {
      console.log(`❌ ${entityType} não encontrado no banco`);
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
    
    // Create transfer with enhanced metadata
    console.log(`💸 [STRIPE] Creating transfer of €${amountNum} to ${stripeAccountId}`);
    const transfer = await stripe.transfers.create({
      amount: Math.round(amountNum * 100),
      currency: 'eur',
      destination: stripeAccountId,
      description: description || `Pagamento para ${beneficiaryName}`,
      metadata: {
        entity_type: entityType,
        entity_id: entityId,
        beneficiary_name: beneficiaryName,
        beneficiary_email: beneficiaryEmail,
        source: 'backoffice_direct_transfer',
        initiated_by: user.email,
        initiated_at: new Date().toISOString(),
      },
    });
    
    console.log(`✅ [STRIPE] Transfer successful: ${transfer.id}`);
    
    // Log to audit trail
    await logCRUD(
      user.userId,
      user.email,
      'create',
      'stripe_transfers',
      transfer.id,
      {
        before: null,
        after: {
          transferId: transfer.id,
          entityType,
          entityId,
          beneficiaryName,
          beneficiaryEmail,
          amount: amountNum,
          description,
          stripeDestination: stripeAccountId,
        }
      },
      request
    );
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  [PERFORMANCE] Request completed in ${duration}ms`);
    
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
    const duration = Date.now() - startTime;
    console.error(`❌ [ERROR] Transfer failed after ${duration}ms:`, {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao processar transferência',
        code: error.code,
        type: error.type,
      },
      { status: 500 }
    );
  }
}
