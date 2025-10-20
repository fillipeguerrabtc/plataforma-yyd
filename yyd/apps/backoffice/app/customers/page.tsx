import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getCustomers() {
  return await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      bookings: {
        include: {
          product: true,
        },
      },
    },
  });
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          👥 CRM de Clientes
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          Gerencie todos os clientes e seu histórico de reservas
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-100)' }}>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Telefone</th>
              <th style={thStyle}>País</th>
              <th style={thStyle}>Total Reservas</th>
              <th style={thStyle}>Total Gasto</th>
              <th style={thStyle}>Última Reserva</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: '600' }}>{customer.name}</div>
                </td>
                <td style={tdStyle}>{customer.email}</td>
                <td style={tdStyle}>{customer.phone || '-'}</td>
                <td style={tdStyle}>{customer.country || '-'}</td>
                <td style={tdStyle}>{customer.totalBookings}</td>
                <td style={tdStyle}>
                  <span style={{ fontWeight: '600', color: 'var(--brand-turquoise)' }}>
                    €{parseFloat(customer.totalSpent.toString())}
                  </span>
                </td>
                <td style={tdStyle}>
                  {customer.lastBookingAt
                    ? new Date(customer.lastBookingAt).toLocaleDateString('pt-BR')
                    : '-'}
                </td>
                <td style={tdStyle}>
                  <Link
                    href={`/customers/${customer.id}`}
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
