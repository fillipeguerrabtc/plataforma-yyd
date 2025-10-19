import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

async function getProduct(slug: string) {
  return await prisma.product.findUnique({ where: { slug } });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    return <div style={{ padding: '2rem' }}>Product not found</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link href="/" style={{ color: '#3b82f6', marginBottom: '2rem', display: 'inline-block' }}>
        ← Back to all tours
      </Link>

      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', marginTop: '1rem' }}>
        {product.imageUrls.length > 0 && (
          <div style={{
            height: '400px',
            background: `url(${product.imageUrls[0]}) center/cover`,
            borderRadius: '8px',
            marginBottom: '2rem'
          }} />
        )}

        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{product.title}</h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
          {product.description}
        </p>

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Price</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              €{Number(product.priceEur).toFixed(2)}
            </div>
          </div>
          {product.duration && (
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Duration</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{product.duration}</div>
            </div>
          )}
        </div>

        <Link
          href={`/checkout/${product.slug}`}
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#3b82f6',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1.125rem'
          }}
        >
          Book Now →
        </Link>
      </div>
    </div>
  );
}
