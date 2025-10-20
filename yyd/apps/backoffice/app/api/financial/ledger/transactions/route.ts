import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const user = requirePermission(request, 'finance', 'create');
    const body = await request.json();

    const { transactionId, transactionType, description, entries } = body;

    if (!transactionId || !entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'transactionId and entries array are required' },
        { status: 400 }
      );
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of entries) {
      const debit = parseFloat(entry.debit || 0);
      const credit = parseFloat(entry.credit || 0);

      if (debit < 0 || credit < 0) {
        return NextResponse.json({ error: 'Debit and credit must be non-negative' }, { status: 400 });
      }

      if (debit > 0 && credit > 0) {
        return NextResponse.json({ error: 'Each entry must have either debit OR credit, not both' }, { status: 400 });
      }

      totalDebit += debit;
      totalCredit += credit;
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { error: `Transaction not balanced: debits=${totalDebit}, credits=${totalCredit}` },
        { status: 400 }
      );
    }

    const accountIds = entries.map((e: any) => e.accountId);
    const accounts = await prisma.account.findMany({
      where: { id: { in: accountIds } },
    });

    if (accounts.length !== accountIds.length) {
      return NextResponse.json({ error: 'One or more account IDs not found' }, { status: 404 });
    }

    const accountMap = new Map(accounts.map((a) => [a.id, a]));
    const currency = accounts[0]?.currency || 'EUR';

    for (const account of accounts) {
      if (account.currency !== currency) {
        return NextResponse.json(
          { error: `All accounts must use same currency (found ${account.currency} vs ${currency})` },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const createdEntries = [];

      for (const entry of entries) {
        const debit = parseFloat(entry.debit || 0);
        const credit = parseFloat(entry.credit || 0);

        const ledgerEntry = await tx.ledgerEntry.create({
          data: {
            accountId: entry.accountId,
            transactionId,
            transactionType: transactionType || 'manual',
            description: entry.description || description || '',
            debit,
            credit,
            currency,
            metadata: entry.metadata || {},
          },
        });

        createdEntries.push(ledgerEntry);

        const netChange = credit - debit;
        await tx.account.update({
          where: { id: entry.accountId },
          data: {
            balance: {
              increment: netChange,
            },
          },
        });
      }

      return createdEntries;
    });

    await logCRUD(
      user.userId,
      user.email,
      'create',
      'ledger_transaction',
      transactionId,
      { after: { transactionId, entries: result.length } },
      request
    );

    return NextResponse.json({
      success: true,
      transactionId,
      entries: result,
    });
  } catch (error: any) {
    console.error('Ledger transaction error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
