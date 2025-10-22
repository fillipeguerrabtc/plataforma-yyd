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

export async function GET(request: NextRequest) {
  try {
    requirePermission(request, 'finance', 'read');
    
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') as EntityType;
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'entityType e entityId são obrigatórios' }, { status: 400 });
    }

    const entity = await getEntity(entityType, entityId);

    if (!entity) {
      return NextResponse.json({ error: 'Entidade não encontrada' }, { status: 404 });
    }

    if (!entity.stripeConnectedAccountId) {
      return NextResponse.json({ error: 'Conta Stripe não criada' }, { status: 400 });
    }

    const balance = await stripe.balance.retrieve({
      stripeAccount: entity.stripeConnectedAccountId,
    });

    const totalAvailable = balance.available.reduce((sum, b) => sum + b.amount, 0);
    const totalPending = balance.pending.reduce((sum, b) => sum + b.amount, 0);

    return NextResponse.json({
      success: true,
      accountId: entity.stripeConnectedAccountId,
      totalAvailable,
      totalPending,
      available: balance.available,
      pending: balance.pending,
    });
  } catch (error: any) {
    console.error('Erro ao consultar saldo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao consultar saldo' },
      { status: 500 }
    );
  }
}
