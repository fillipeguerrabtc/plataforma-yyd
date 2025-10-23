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
      console.log(`⚠️  [VALIDATION] Large amount detected: R$${amountNum}`);
      return NextResponse.json({ 
        error: 'Valor muito alto. Para transferências acima de R$100.000, contate o suporte.' 
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
      entity = await prisma.staff.findUnique({ where: { id: entityId } });
      console.log('📊 Staff found:', entity ? 'SIM' : 'NÃO');
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
    
    // Check account country to determine if we need source_transaction
    console.log(`🌍 [STRIPE] Checking account country for ${stripeAccountId}`);
    const account = await stripe.accounts.retrieve(stripeAccountId);
    const isBrazil = account.country === 'BR';
    
    console.log(`💸 [STRIPE] Creating transfer of R$${amountNum} to ${stripeAccountId} (Country: ${account.country})`);
    
    let transfer;
    
    // For Brazil accounts, Stripe requires source_transaction
    // We'll create a charge first, then use it in the transfer
    if (isBrazil) {
      console.log(`🇧🇷 [BRAZIL] Creating PaymentIntent first for source_transaction requirement`);
      
      // For Brazil accounts, we need to create a PaymentIntent and confirm it
      // This creates a valid charge that can be used as source_transaction
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amountNum * 100),
        currency: 'brl',
        payment_method_types: ['card'],
        confirm: true,
        payment_method: 'pm_card_visa', // Test mode payment method that auto-succeeds
        description: `Cobrança para pagamento de ${beneficiaryName}`,
        metadata: {
          purpose: 'salary_payment_source',
          beneficiary: beneficiaryName,
          entity_type: entityType,
        },
      });
      
      console.log(`✅ [STRIPE] PaymentIntent created and confirmed: ${paymentIntent.id}, Charge: ${paymentIntent.latest_charge}`);
      
      // Now create the transfer with source_transaction using the charge ID
      transfer = await stripe.transfers.create({
        amount: Math.round(amountNum * 100),
        currency: 'brl',
        destination: stripeAccountId,
        source_transaction: paymentIntent.latest_charge as string, // Required for Brazil
        description: description || `Pagamento para ${beneficiaryName}`,
        metadata: {
          entity_type: entityType,
          entity_id: entityId,
          beneficiary_name: beneficiaryName,
          beneficiary_email: beneficiaryEmail,
          source: 'backoffice_direct_transfer',
          initiated_by: user.email,
          initiated_at: new Date().toISOString(),
          source_payment_intent: paymentIntent.id,
        },
      });
      
      console.log(`✅ [STRIPE] Transfer with source_transaction successful: ${transfer.id}`);
    } else {
      // For non-Brazil accounts, direct transfer works
      transfer = await stripe.transfers.create({
        amount: Math.round(amountNum * 100),
        currency: 'brl',
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
    }
    
    // 📊 Create accounting records (Ledger Entries with double-entry bookkeeping)
    // CRITICAL: Accounting is MANDATORY - if it fails, the whole transfer must fail
    console.log(`📊 [ACCOUNTING] Creating ledger entries for R$${amountNum}`);
    
    try {
      // Get required accounts - MUST exist for finance operations
      const [stripeAccount, salaryExpenseAccount] = await Promise.all([
        prisma.account.findUnique({ where: { code: 'STRIPE-CASH' } }),
        prisma.account.findUnique({ where: { code: 'SALARY-EXP' } }),
      ]);
      
      if (!stripeAccount) {
        throw new Error('Conta contábil STRIPE-CASH não encontrada. Configure a conta no Finance > Accounts.');
      }
      
      if (!salaryExpenseAccount) {
        throw new Error('Conta contábil SALARY-EXP não encontrada. Configure a conta no Finance > Accounts.');
      }
      
      // Convert to string for Decimal compatibility
      const amountStr = amountNum.toFixed(2);
      
      // CRITICAL: Wrap all accounting operations in atomic transaction
      // This ensures all-or-nothing persistence (no orphaned records)
      await prisma.$transaction(async (tx) => {
        // 1. Create Transaction record
        const transaction = await tx.transaction.create({
          data: {
            type: 'payment_out',
            description: description || `Pagamento de salário para ${beneficiaryName}`,
            amount: amountStr,
            currency: 'BRL',
            status: 'completed',
            reference: transfer.id, // Link to Stripe transfer
            metadata: {
              stripeTransferId: transfer.id,
              entityType,
              entityId,
              beneficiaryName,
              beneficiaryEmail,
              source: 'stripe_connect_direct_transfer',
            },
          },
        });
        
        console.log(`✅ [ACCOUNTING] Transaction created: ${transaction.id}`);
        
        // 2. Create double-entry ledger entries
        await tx.ledgerEntry.createMany({
          data: [
            {
              accountId: salaryExpenseAccount.id,
              transactionId: transaction.id,
              transactionType: 'salary_payment',
              description: `Pagamento de salário: ${beneficiaryName}`,
              debit: amountStr,
              credit: '0.00',
              currency: 'BRL',
              metadata: {
                entityType,
                entityId,
                beneficiaryName,
                beneficiaryEmail,
              },
            },
            {
              accountId: stripeAccount.id,
              transactionId: transaction.id,
              transactionType: 'salary_payment',
              description: `Transferência Stripe: ${beneficiaryName}`,
              debit: '0.00',
              credit: amountStr,
              currency: 'BRL',
              metadata: {
                stripeTransferId: transfer.id,
                destination: stripeAccountId,
              },
            },
          ],
        });
        
        // 3. Update account balances atomically
        await Promise.all([
          tx.account.update({
            where: { id: salaryExpenseAccount.id },
            data: { balance: { increment: amountStr } }, // Expense increases with debit
          }),
          tx.account.update({
            where: { id: stripeAccount.id },
            data: { balance: { decrement: amountStr } }, // Asset decreases with credit
          }),
        ]);
        
        console.log(`✅ [ACCOUNTING] All accounting records committed atomically`);
      });
      
    } catch (accountingError: any) {
      console.error(`❌ [ACCOUNTING] Failed to create ledger entries:`, {
        message: accountingError.message,
        code: accountingError.code,
        stack: accountingError.stack
      });
      
      // CRITICAL: Accounting is mandatory - throw error to fail the whole operation
      throw new Error(`Falha na criação dos lançamentos contábeis: ${accountingError.message}`);
    }
    
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
      message: `✅ Transferência de R$${(transfer.amount / 100).toFixed(2)} para ${beneficiaryName} realizada com sucesso!`,
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
