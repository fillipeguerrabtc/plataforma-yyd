import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getDashboardData() {
  const [productsCount, bookingsCount, customersCount] = await Promise.all([
    prisma.product.count(),
    prisma.booking.count(),
    prisma.customer.count()
  ]);

  return {products: productsCount, bookings: bookingsCount, customers: customersCount };
}

export default async function Dashboard() {
  const data = await getDashboardData();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📊 Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
        <Card title="Products" value={data.products} />
        <Card title="Bookings" value={data.bookings} />
        <Card title="Customers" value={data.customers} />
      </div>
      <div style={{ marginTop: '2rem' }}>
        <form action="/dashboard/explain" method="POST">
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            💬 Explicar com Aurora
          </button>
        </form>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{value}</div>
    </div>
  );
}
