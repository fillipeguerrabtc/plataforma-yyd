import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

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

export async function POST(request: NextRequest) {
  try {
    const { entityType, entityId } = await request.json();

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'entityType e entityId são obrigatórios' }, { status: 400 });
    }

    const entity = await getEntity(entityType, entityId);

    if (!entity) {
      return NextResponse.json({ error: 'Entidade não encontrada' }, { status: 404 });
    }

    if (!entity.stripeConnectedAccountId) {
      return NextResponse.json({ error: 'Conta Stripe não criada ainda' }, { status: 400 });
    }

    const accountLink = await stripe.accountLinks.create({
      account: entity.stripeConnectedAccountId,
      refresh_url: `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}:3001` : 'http://localhost:3001'}/finance/stripe-connect`,
      return_url: `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}:3001` : 'http://localhost:3001'}/finance/stripe-connect?onboarding=success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      success: true,
      url: accountLink.url,
      message: 'Link de onboarding gerado. Abrindo em nova aba...',
    });
  } catch (error: any) {
    console.error('Erro ao gerar onboarding link:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar link' },
      { status: 500 }
    );
  }
}
