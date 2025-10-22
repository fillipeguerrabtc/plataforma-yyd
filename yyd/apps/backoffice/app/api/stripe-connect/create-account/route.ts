import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

type EntityType = 'guide' | 'staff' | 'vendor';

async function getEntity(entityType: EntityType, entityId: string) {
  switch (entityType) {
    case 'guide':
      return await prisma.guide.findUnique({ where: { id: entityId } });
    case 'staff':
      return await prisma.staff.findUnique({ where: { id: entityId } });
    case 'vendor':
      return await prisma.vendor.findUnique({ where: { id: entityId } });
  }
}

async function updateEntity(entityType: EntityType, entityId: string, data: any) {
  switch (entityType) {
    case 'guide':
      return await prisma.guide.update({ where: { id: entityId }, data });
    case 'staff':
      return await prisma.staff.update({ where: { id: entityId }, data });
    case 'vendor':
      return await prisma.vendor.update({ where: { id: entityId }, data });
  }
}

export async function POST(request: NextRequest) {
  try {
    requirePermission(request, 'finance', 'manage_stripe_connect');
    
    const { entityType, entityId } = await request.json();

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'entityType e entityId são obrigatórios' }, { status: 400 });
    }

    const entity = await getEntity(entityType, entityId);

    if (!entity) {
      return NextResponse.json({ error: 'Entidade não encontrada' }, { status: 404 });
    }

    if (entity.stripeConnectedAccountId) {
      return NextResponse.json(
        { error: 'Já possui conta Stripe Connect' },
        { status: 400 }
      );
    }

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'BR',
      email: entity.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: entityType === 'vendor' ? 'company' : 'individual',
      metadata: {
        entity_type: entityType,
        entity_id: entity.id,
        entity_name: entity.name,
      },
    });

    await updateEntity(entityType, entityId, {
      stripeConnectedAccountId: account.id,
      stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
      stripeAccountType: account.type,
      stripeOnboardingCompleted: account.details_submitted || false,
    });

    console.log(`✅ Stripe Connect account created for ${entityType} ${entity.name}`);

    return NextResponse.json({
      success: true,
      accountId: account.id,
      status: account.charges_enabled ? 'active' : 'pending',
      message: 'Conta Stripe Connect criada com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao criar conta Stripe Connect:', error);
    
    // Check if it's a Stripe Connect not enabled error
    if (error.message && error.message.includes("signed up for Connect")) {
      return NextResponse.json(
        { 
          error: 'Stripe Connect não está ativado na sua conta Stripe. Por favor, acesse https://dashboard.stripe.com/settings/applications e ative o Stripe Connect primeiro.',
          needsSetup: true
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Erro ao criar conta' },
      { status: 500 }
    );
  }
}
