import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

async function getProducts() {
  return await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' }
  });
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>🚗 Yes You Deserve Tours</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}>
              {product.imageUrls.length > 0 && (
                <div style={{
                  height: '200px',
                  background: `url(${product.imageUrls[0]}) center/cover`,
                  backgroundSize: 'cover'
                }} />
              )}
              <div style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{product.title}</h2>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {product.description.slice(0, 100)}...
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    €{Number(product.priceEur).toFixed(2)}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {product.duration || 'Flexible'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
          <p>No products available at the moment.</p>
        </div>
      )}
    </div>
  );
}
