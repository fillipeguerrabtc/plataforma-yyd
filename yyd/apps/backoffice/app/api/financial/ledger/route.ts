import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    requireResourceAccess(request, 'finance');

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const transactionId = searchParams.get('transactionId');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};
    if (accountId) where.accountId = accountId;
    if (transactionId) where.transactionId = transactionId;

    const entries = await prisma.ledgerEntry.findMany({
      where,
      include: {
        account: {
          select: {
            code: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(entries);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
