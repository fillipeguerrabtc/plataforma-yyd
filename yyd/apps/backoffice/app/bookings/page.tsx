import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getBookings(status?: string) {
  const where = status && status !== 'all' ? { status } : {};
  
  return await prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      product: true,
      customer: true,
      guide: true,
    },
  });
}

async function getBookingStats() {
  const [total, confirmed, pending, completed, cancelled] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'confirmed' } }),
    prisma.booking.count({ where: { status: 'pending_payment' } }),
    prisma.booking.count({ where: { status: 'completed' } }),
    prisma.booking.count({ where: { status: 'cancelled' } }),
  ]);

  return { total, confirmed, pending, completed, cancelled };
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const [bookings, stats] = await Promise.all([
    getBookings(searchParams.status),
    getBookingStats(),
  ]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          🎫 Gestão de Reservas
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          Gerencie todas as reservas e atribua guias
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <FilterButton href="/bookings?status=all" label="Todas" count={stats.total} active={!searchParams.status || searchParams.status === 'all'} />
        <FilterButton href="/bookings?status=confirmed" label="Confirmadas" count={stats.confirmed} active={searchParams.status === 'confirmed'} />
        <FilterButton href="/bookings?status=pending_payment" label="Pendentes" count={stats.pending} active={searchParams.status === 'pending_payment'} />
        <FilterButton href="/bookings?status=completed" label="Concluídas" count={stats.completed} active={searchParams.status === 'completed'} />
        <FilterButton href="/bookings?status=cancelled" label="Canceladas" count={stats.cancelled} active={searchParams.status === 'cancelled'} />
      </div>

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-100)' }}>
              <th style={thStyle}>Referência</th>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Tour</th>
              <th style={thStyle}>Pessoas</th>
              <th style={thStyle}>Valor</th>
              <th style={thStyle}>Guia</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <td style={tdStyle}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {booking.bookingNumber}
                  </span>
                </td>
                <td style={tdStyle}>
                  {new Date(booking.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: '600' }}>{booking.customer.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    {booking.customer.email}
                  </div>
                </td>
                <td style={tdStyle}>{booking.product.titlePt}</td>
                <td style={tdStyle}>{booking.numberOfPeople}</td>
                <td style={tdStyle}>
                  <span style={{ fontWeight: '600', color: 'var(--brand-turquoise)' }}>
                    R${parseFloat(booking.priceEur.toString())}
                  </span>
                </td>
                <td style={tdStyle}>
                  {booking.guide ? (
                    <span>{booking.guide.name}</span>
                  ) : (
                    <span style={{ color: 'var(--brand-gold)' }}>⚠️ Sem guia</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <StatusBadge status={booking.status} />
                </td>
                <td style={tdStyle}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: 'var(--brand-turquoise)',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterButton({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: '0.75rem 1.25rem',
        background: active ? 'var(--brand-turquoise)' : 'white',
        color: active ? 'white' : 'var(--gray-700)',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '600',
        border: active ? 'none' : '1px solid var(--gray-300)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      {label}
      <span
        style={{
          padding: '0.25rem 0.5rem',
          background: active ? 'rgba(255,255,255,0.2)' : 'var(--gray-100)',
          borderRadius: '999px',
          fontSize: '0.75rem',
        }}
      >
        {count}
      </span>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: { [key: string]: { bg: string; text: string } } = {
    confirmed: { bg: 'var(--brand-turquoise)15', text: 'var(--brand-turquoise)' },
    pending_payment: { bg: 'var(--brand-gold)15', text: 'var(--brand-gold)' },
    completed: { bg: 'var(--gray-200)', text: 'var(--gray-700)' },
    cancelled: { bg: 'var(--brand-bordeaux)15', text: 'var(--brand-bordeaux)' },
  };

  const colorScheme = colors[status] || colors.pending_payment;

  return (
    <span
      style={{
        padding: '0.25rem 0.75rem',
        background: colorScheme.bg,
        color: colorScheme.text,
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: '600',
      }}
    >
      {status}
    </span>
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
