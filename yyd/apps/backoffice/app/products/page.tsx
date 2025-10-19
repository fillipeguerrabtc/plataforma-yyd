import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

async function getProducts() {
  return await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
}

export default async function Products() {
  const products = await getProducts();

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>📦 Products ({products.length})</h1>
        <Link href="/" style={{ padding: '0.5rem 1rem', background: '#6b7280', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>← Back</Link>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Price (EUR)</th>
            <th style={thStyle}>Active</th>
            <th style={thStyle}>External URL</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td style={tdStyle}>{p.title}</td>
              <td style={tdStyle}>€{Number(p.priceEur).toFixed(2)}</td>
              <td style={tdStyle}>{p.active ? '✅' : '❌'}</td>
              <td style={tdStyle}>
                {p.externalUrl ? (
                  <a href={p.externalUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                    Link
                  </a>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { padding: '0.75rem', textAlign: 'left' as const, fontSize: '0.875rem', fontWeight: '600', color: '#374151' };
const tdStyle = { padding: '0.75rem', borderTop: '1px solid #e5e7eb', fontSize: '0.875rem' };
