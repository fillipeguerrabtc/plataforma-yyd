import { NextRequest, NextResponse } from 'next/server';
import { reason } from '@yyd/proxy-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kpis } = body;

    const result = await reason('classify_msg', {
      source: 'finance',
      kpis
    });

    return NextResponse.json({
      rationale_short: result.params?.rationale || 'Dados processados com sucesso'
    });
  } catch (error) {
    console.error('Explain error:', error);
    return NextResponse.json({ error: 'Failed to explain' }, { status: 500 });
  }
}
