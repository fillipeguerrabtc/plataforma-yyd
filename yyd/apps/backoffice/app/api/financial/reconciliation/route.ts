import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess } from '@/lib/auth';

// GET /api/financial/reconciliation - Get financial reconciliation data
export async function GET(request: NextRequest) {
  try {
    // Require access to finance resource
    requireResourceAccess(request, 'finance');
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Fetch all financial data in parallel
    const [
      totalRevenue,
      pendingReceivables,
      paidReceivables,
      pendingPayables,
      paidPayables,
      recentPayments,
    ] = await Promise.all([
      // Total revenue from succeeded payments
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'succeeded',
          ...(Object.keys(dateFilter).length > 0 ? { paidAt: dateFilter } : {}),
        },
      }),
      // Pending receivables
      prisma.accountsReceivable.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          status: 'open',
          ...(Object.keys(dateFilter).length > 0 ? { dueDate: dateFilter } : {}),
        },
      }),
      // Paid receivables
      prisma.accountsReceivable.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          status: 'paid',
          ...(Object.keys(dateFilter).length > 0 ? { paidAt: dateFilter } : {}),
        },
      }),
      // Pending payables
      prisma.accountsPayable.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          status: 'open',
          ...(Object.keys(dateFilter).length > 0 ? { dueDate: dateFilter } : {}),
        },
      }),
      // Paid payables
      prisma.accountsPayable.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          status: 'paid',
          ...(Object.keys(dateFilter).length > 0 ? { paidAt: dateFilter } : {}),
        },
      }),
      // Recent payments for cash flow
      prisma.payment.findMany({
        where: {
          status: 'succeeded',
          ...(Object.keys(dateFilter).length > 0 ? { paidAt: dateFilter } : {}),
        },
        orderBy: { paidAt: 'desc' },
        take: 100,
        select: {
          amount: true,
          paidAt: true,
        },
      }),
    ]);

    // Calculate net position (convert Decimal to number)
    const totalRevenueNum = Number(totalRevenue._sum.amount || 0);
    const paidReceivablesNum = Number(paidReceivables._sum.amount || 0);
    const paidPayablesNum = Number(paidPayables._sum.amount || 0);
    const totalIncome = totalRevenueNum + paidReceivablesNum;
    const totalExpenses = paidPayablesNum;
    const netPosition = totalIncome - totalExpenses;

    // Calculate pending balance (convert Decimal to number)
    const pendingIncome = Number(pendingReceivables._sum.amount || 0);
    const pendingExpenses = Number(pendingPayables._sum.amount || 0);
    const pendingBalance = pendingIncome - pendingExpenses;

    return NextResponse.json({
      summary: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalIncome,
        totalExpenses,
        netPosition,
        pendingIncome,
        pendingExpenses,
        pendingBalance,
      },
      receivables: {
        pending: {
          count: pendingReceivables._count,
          total: pendingReceivables._sum.amount || 0,
        },
        paid: {
          count: paidReceivables._count,
          total: paidReceivables._sum.amount || 0,
        },
      },
      payables: {
        pending: {
          count: pendingPayables._count,
          total: pendingPayables._sum.amount || 0,
        },
        paid: {
          count: paidPayables._count,
          total: paidPayables._sum.amount || 0,
        },
      },
      cashFlow: recentPayments.map(p => ({
        amount: p.amount,
        date: p.paidAt,
      })),
    });
  } catch (error: any) {
    console.error('Reconciliation GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
