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

export async function POST(request: NextRequest) {
  try {
    requirePermission(request, 'finance', 'read');
    
    const { entityType, entityId } = await request.json();

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

    const loginLink = await stripe.accounts.createLoginLink(entity.stripeConnectedAccountId);

    return NextResponse.json({
      success: true,
      url: loginLink.url,
      message: 'Link gerado com sucesso. Abrindo dashboard Stripe...',
    });
  } catch (error: any) {
    console.error('Erro ao gerar login link:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar link' },
      { status: 500 }
    );
  }
}
