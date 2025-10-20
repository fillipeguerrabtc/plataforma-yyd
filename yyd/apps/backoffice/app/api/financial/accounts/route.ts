import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission, requireResourceAccess } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    requireResourceAccess(request, 'finance');

    const accounts = await prisma.account.findMany({
      include: {
        _count: {
          select: { ledgerEntries: true },
        },
      },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requirePermission(request, 'finance', 'create');
    const body = await request.json();

    const { code, name, type, category, currency } = body;

    if (!code || !name || !type) {
      return NextResponse.json({ error: 'code, name, and type are required' }, { status: 400 });
    }

    const account = await prisma.account.create({
      data: {
        code,
        name,
        type,
        category,
        currency: currency || 'EUR',
        balance: 0,
        active: true,
      },
    });

    await logCRUD(user.userId, user.email, 'create', 'accounts', account.id, { after: account }, request);

    return NextResponse.json(account);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
