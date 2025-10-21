import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';
import { z } from 'zod';

const AccountUpdateSchema = z.object({
  code: z.string().optional(),
  name: z.string().optional(),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']).optional(),
  category: z.string().optional(),
  currency: z.string().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requirePermission(request, 'finance', 'update');
    const body = await request.json();
    const validated = AccountUpdateSchema.parse(body);

    const before = await prisma.account.findUnique({
      where: { id: params.id },
    });

    if (!before) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (validated.code && validated.code !== before.code) {
      const existing = await prisma.account.findUnique({
        where: { code: validated.code },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Account code already exists' },
          { status: 400 }
        );
      }
    }

    const account = await prisma.account.update({
      where: { id: params.id },
      data: validated,
    });

    await logCRUD(user.userId, user.email, 'update', 'accounts', account.id, { before, after: account }, request);

    return NextResponse.json(account);
  } catch (error: any) {
    console.error('PATCH /api/financial/accounts/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update account' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requirePermission(request, 'finance', 'delete');

    const account = await prisma.account.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { ledgerEntries: true },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account._count.ledgerEntries > 0) {
      return NextResponse.json(
        { error: 'Cannot delete account with ledger entries' },
        { status: 400 }
      );
    }

    await prisma.account.delete({
      where: { id: params.id },
    });

    await logCRUD(user.userId, user.email, 'delete', 'accounts', params.id, { before: account }, request);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/financial/accounts/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 400 }
    );
  }
}
