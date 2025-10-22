import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requirePermission } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function GET(request: NextRequest) {
  try {
    requirePermission(request, 'finance', 'read');
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Get recent transfers
    const transfers = await stripe.transfers.list({
      limit: Math.min(limit, 100),
    });
    
    return NextResponse.json({
      success: true,
      transfers: transfers.data.map((t) => ({
        id: t.id,
        amount: t.amount / 100,
        currency: t.currency.toUpperCase(),
        destination: t.destination,
        description: t.description,
        created: t.created,
        metadata: t.metadata,
      })),
    });
    
  } catch (error: any) {
    console.error('❌ Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar histórico' },
      { status: 500 }
    );
  }
}
