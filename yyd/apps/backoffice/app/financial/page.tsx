import { prisma } from '@/lib/prisma';

async function getFinancialData() {
  const [totalRevenue, monthlyRevenue, pendingReceivables, pendingPayables, recentPayments] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'succeeded' },
    }),
    prisma.payment.groupBy({
      by: ['createdAt'],
      _sum: { amount: true },
      where: {
        status: 'succeeded',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.accountsReceivable.aggregate({
      _sum: { amount: true },
      where: { status: 'open' },
    }),
    prisma.accountsPayable.aggregate({
      _sum: { amount: true },
      where: { status: 'open' },
    }),
    prisma.payment.findMany({
      take: 10,
      orderBy: { paidAt: 'desc' },
      where: { status: 'succeeded' },
      include: {
        booking: {
          include: {
            customer: true,
            product: true,
          },
        },
      },
    }),
  ]);

  const monthTotal = monthlyRevenue.reduce((sum, item) => sum + parseFloat(item._sum.amount?.toString() || '0'), 0);

  return {
    totalRevenue: totalRevenue._sum.amount || 0,
    monthlyRevenue: monthTotal,
    pendingReceivables: pendingReceivables._sum.amount || 0,
    pendingPayables: pendingPayables._sum.amount || 0,
    recentPayments,
  };
}

export default async function FinancialPage() {
  const data = await getFinancialData();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          💰 Dashboard Financeiro
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          Visão geral da saúde financeira do negócio
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          title="Receita Total"
          value={`€${parseFloat(data.totalRevenue.toString()).toFixed(0)}`}
          icon="💰"
          color="var(--brand-turquoise)"
        />
        <StatCard
          title="Receita do Mês"
          value={`€${data.monthlyRevenue.toFixed(0)}`}
          icon="📈"
          color="var(--brand-turquoise)"
        />
        <StatCard
          title="Contas a Receber"
          value={`€${parseFloat(data.pendingReceivables.toString()).toFixed(0)}`}
          icon="📥"
          color="var(--brand-gold)"
        />
        <StatCard
          title="Contas a Pagar"
          value={`€${parseFloat(data.pendingPayables.toString()).toFixed(0)}`}
          icon="📤"
          color="var(--brand-bordeaux)"
        />
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          📋 Pagamentos Recentes
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-100)' }}>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Tour</th>
              <th style={thStyle}>Valor</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.recentPayments.map((payment: any) => (
              <tr key={payment.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <td style={tdStyle}>
                  {payment.paidAt
                    ? new Date(payment.paidAt).toLocaleDateString('pt-BR')
                    : '-'}
                </td>
                <td style={tdStyle}>{payment.booking.customer.name}</td>
                <td style={tdStyle}>{payment.booking.product.titlePt}</td>
                <td style={tdStyle}>
                  <span style={{ fontWeight: '600', color: 'var(--brand-turquoise)' }}>
                    €{parseFloat(payment.amount.toString())}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: 'var(--brand-turquoise)15',
                      color: 'var(--brand-turquoise)',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
            {title}
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
            {value}
          </p>
        </div>
        <div
          style={{
            width: '48px',
            height: '48px',
            background: `${color}15`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '0.75rem 1rem',
  textAlign: 'left' as const,
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--gray-700)',
};

const tdStyle = {
  padding: '1rem',
  fontSize: '0.875rem',
  color: 'var(--gray-800)',
};
