import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission, requireResourceAccess } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';
import { z } from 'zod';

const AccountCreateSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  category: z.string().optional(),
  currency: z.string().default('BRL'),
});

export async function GET(request: NextRequest) {
  try {
    requireResourceAccess(request, 'finance');

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const active = searchParams.get('active');

    const where: any = {};
    if (type) where.type = type;
    if (active !== null && active !== '') {
      where.active = active === 'true';
    }

    const accounts = await prisma.account.findMany({
      where,
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
    const validated = AccountCreateSchema.parse(body);

    const existing = await prisma.account.findUnique({
      where: { code: validated.code },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Account code already exists' },
        { status: 400 }
      );
    }

    const account = await prisma.account.create({
      data: {
        ...validated,
        balance: 0,
        active: true,
      },
    });

    await logCRUD(user.userId, user.email, 'create', 'accounts', account.id, { after: account }, request);

    return NextResponse.json(account);
  } catch (error: any) {
    console.error('POST /api/financial/accounts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 400 }
    );
  }
}
