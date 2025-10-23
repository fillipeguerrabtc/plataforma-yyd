import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserFromRequest } from '@/lib/auth';
import { hasPermission, canAccess, UserRole } from '@/lib/rbac';

async function getDashboardStats() {
  const [
    totalBookings,
    confirmedBookings,
    pendingBookings,
    totalCustomers,
    totalRevenue,
    upcomingTours,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'confirmed' } }),
    prisma.booking.count({ where: { status: 'pending_payment' } }),
    prisma.customer.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'succeeded' },
    }),
    prisma.booking.findMany({
      where: {
        date: { gte: new Date() },
        status: 'confirmed',
      },
      orderBy: { date: 'asc' },
      take: 5,
      include: {
        product: true,
        customer: true,
        guide: true,
      },
    }),
  ]);

  return {
    totalBookings,
    confirmedBookings,
    pendingBookings,
    totalCustomers,
    totalRevenue: totalRevenue._sum.amount || 0,
    upcomingTours,
  };
}

async function getUserRoleFromCookies(): Promise<UserRole> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token');
  
  if (!token) {
    redirect('/login'); // SECURITY: Redirect unauthenticated users immediately
  }

  try {
    // Create a fake request object to reuse getUserFromRequest
    const request = new Request('http://localhost', {
      headers: { cookie: `auth-token=${token.value}` },
    });
    const user = getUserFromRequest(request);
    
    if (!user) {
      redirect('/login'); // SECURITY: Invalid token - redirect to login
    }
    
    return user.role;
  } catch {
    redirect('/login'); // SECURITY: Error verifying token - redirect to login
  }
}

export default async function Dashboard() {
  const stats = await getDashboardStats();
  const userRole = await getUserRoleFromCookies();
  
  // Check permissions for each card
  const canViewBookings = canAccess(userRole, 'bookings');
  const canViewCustomers = canAccess(userRole, 'customers');
  const canViewFinance = canAccess(userRole, 'finance');

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          📊 Dashboard
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          Bem-vindo ao sistema de gestão YYD
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
        {canViewBookings && (
          <>
            <StatCard
              title="Total de Reservas"
              value={stats.totalBookings}
              icon="🎫"
              color="var(--brand-turquoise)"
            />
            <StatCard
              title="Confirmadas"
              value={stats.confirmedBookings}
              icon="✅"
              color="var(--brand-turquoise)"
            />
            <StatCard
              title="Pendentes"
              value={stats.pendingBookings}
              icon="⏳"
              color="var(--brand-gold)"
            />
          </>
        )}
        {canViewCustomers && (
          <StatCard
            title="Total de Clientes"
            value={stats.totalCustomers}
            icon="👥"
            color="var(--brand-bordeaux)"
          />
        )}
        {canViewFinance && (
          <StatCard
            title="Receita Total"
            value={`R$${parseFloat(stats.totalRevenue.toString()).toFixed(0)}`}
            icon="💰"
            color="var(--brand-turquoise)"
          />
        )}
      </div>

      {canViewBookings && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🗓️ Próximos Tours</h2>
            <Link
              href="/calendar"
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--brand-turquoise)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
              }}
            >
              Ver Calendário Completo
            </Link>
          </div>

          {stats.upcomingTours.length === 0 ? (
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'var(--gray-500)',
            }}
          >
            <p>Nenhum tour confirmado nos próximos dias.</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-100)' }}>
                  <th style={thStyle}>Data</th>
                  <th style={thStyle}>Tour</th>
                  <th style={thStyle}>Cliente</th>
                  <th style={thStyle}>Pessoas</th>
                  <th style={thStyle}>Guia</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcomingTours.map((booking: any) => (
                  <tr key={booking.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <td style={tdStyle}>
                      {new Date(booking.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={tdStyle}>{booking.product.titlePt}</td>
                    <td style={tdStyle}>{booking.customer.name}</td>
                    <td style={tdStyle}>{booking.numberOfPeople}</td>
                    <td style={tdStyle}>
                      {booking.guide ? (
                        booking.guide.name
                      ) : (
                        <span style={{ color: 'var(--brand-gold)' }}>⚠️ Sem guia</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: 'var(--gray-100)',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--brand-turquoise)',
                        }}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}
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
  value: string | number;
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
