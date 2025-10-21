import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult.authenticated || !authResult.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json({ error: 'start and end dates required' }, { status: 400 });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const [payments, payables] = await Promise.all([
      prisma.payment.findMany({
        where: {
          paidAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'paid',
        },
      }),
      prisma.accountsPayable.findMany({
        where: {
          paidAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'paid',
        },
      }),
    ]);

    const revenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const expenses = payables.reduce((sum, p) => sum + Number(p.amount), 0);

    return NextResponse.json({
      revenue,
      expenses,
      profit: revenue - expenses,
      cashIn: revenue,
      cashOut: expenses,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
