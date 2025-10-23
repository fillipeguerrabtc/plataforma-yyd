import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess } from '@/lib/auth';

// GET /api/financial/transactions - Get all financial transactions (income + expenses)
export async function GET(request: NextRequest) {
  try {
    requireResourceAccess(request, 'finance');
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'income', 'expense', or 'all'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Fetch all transaction sources
    const [
      payments,
      paymentOutTransactions,
      accountsPayable,
      accountsReceivable,
    ] = await Promise.all([
      // Income: Stripe payments from customers
      prisma.payment.findMany({
        where: {
          status: 'succeeded',
          ...(Object.keys(dateFilter).length > 0 ? { paidAt: dateFilter } : {}),
        },
        include: {
          booking: {
            include: {
              customer: true,
              product: true,
            },
          },
        },
        orderBy: { paidAt: 'desc' },
      }),
      // Expenses: Salary payments via Stripe Connect
      prisma.transaction.findMany({
        where: {
          type: 'payment_out',
          status: 'completed',
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Expenses: Accounts Payable (vendors, etc)
      prisma.accountsPayable.findMany({
        where: {
          status: 'paid',
          ...(Object.keys(dateFilter).length > 0 ? { paidAt: dateFilter } : {}),
        },
        orderBy: { paidAt: 'desc' },
      }),
      // Income: Accounts Receivable
      prisma.accountsReceivable.findMany({
        where: {
          status: 'paid',
          ...(Object.keys(dateFilter).length > 0 ? { paidAt: dateFilter } : {}),
        },
        include: {
          customer: true,
        },
        orderBy: { paidAt: 'desc' },
      }),
    ]);

    // Transform all transactions into unified format
    const allTransactions: any[] = [];

    // Income from Stripe payments
    if (type === 'income' || type === 'all' || !type) {
      payments.forEach((payment) => {
        allTransactions.push({
          id: payment.id,
          date: payment.paidAt,
          type: 'income',
          category: 'tour_sale',
          categoryLabel: 'Venda de Tour',
          description: payment.booking?.product?.titlePt || 'Pagamento de reserva',
          amount: Number(payment.amount),
          currency: payment.currency,
          source: payment.booking?.customer?.name || 'Cliente',
          sourceEmail: payment.booking?.customer?.email,
          stripeId: payment.stripePaymentIntentId,
          metadata: {
            bookingId: payment.bookingId,
            customerName: payment.booking?.customer?.name,
            tourName: payment.booking?.product?.titlePt,
          },
        });
      });

      accountsReceivable.forEach((ar) => {
        allTransactions.push({
          id: ar.id,
          date: ar.paidAt,
          type: 'income',
          category: 'receivable',
          categoryLabel: 'Conta Recebida',
          description: ar.description || 'Recebimento',
          amount: Number(ar.amount),
          currency: ar.currency,
          source: ar.customer?.name || 'Cliente',
          sourceEmail: ar.customer?.email,
          metadata: {
            customerId: ar.customerId,
            dueDate: ar.dueDate,
          },
        });
      });
    }

    // Expenses
    if (type === 'expense' || type === 'all' || !type) {
      paymentOutTransactions.forEach((transaction) => {
        const metadata = transaction.metadata as any;
        allTransactions.push({
          id: transaction.id,
          date: transaction.createdAt,
          type: 'expense',
          category: 'salary',
          categoryLabel: 'Pagamento de Salário',
          description: transaction.description || 'Pagamento de salário',
          amount: Number(transaction.amount),
          currency: transaction.currency,
          beneficiary: metadata?.beneficiaryName || 'Funcionário',
          beneficiaryEmail: metadata?.beneficiaryEmail,
          entityType: metadata?.entityType,
          stripeId: transaction.reference,
          metadata: {
            entityType: metadata?.entityType,
            entityId: metadata?.entityId,
            stripeTransferId: metadata?.stripeTransferId,
          },
        });
      });

      accountsPayable.forEach((ap) => {
        allTransactions.push({
          id: ap.id,
          date: ap.paidAt,
          type: 'expense',
          category: 'vendor',
          categoryLabel: 'Pagamento a Fornecedor',
          description: ap.description || 'Pagamento a fornecedor',
          amount: Number(ap.amount),
          currency: ap.currency,
          beneficiary: ap.vendor || 'Fornecedor',
          metadata: {
            vendor: ap.vendor,
            dueDate: ap.dueDate,
          },
        });
      });
    }

    // Sort all transactions by date (most recent first)
    allTransactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    // Calculate summary
    const totalIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      transactions: allTransactions,
      summary: {
        totalIncome,
        totalExpenses,
        netPosition: totalIncome - totalExpenses,
        count: allTransactions.length,
      },
    });
  } catch (error: any) {
    console.error('Transactions GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
