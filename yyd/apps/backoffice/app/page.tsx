import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🏢 YYD Backoffice</h1>
      <nav style={{ marginTop: '2rem' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '1rem' }}>
            <Link href="/dashboard" style={{ fontSize: '1.2rem' }}>📊 Dashboard</Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link href="/products" style={{ fontSize: '1.2rem' }}>📦 Products</Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link href="/reservations" style={{ fontSize: '1.2rem' }}>🎫 Reservations</Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link href="/finance" style={{ fontSize: '1.2rem' }}>💰 Finance</Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link href="/integrations" style={{ fontSize: '1.2rem' }}>🔌 Integrations</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
