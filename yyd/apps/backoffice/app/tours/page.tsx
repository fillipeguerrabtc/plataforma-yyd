import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getTours() {
  return await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      seasonPrices: true,
      _count: {
        select: { bookings: true },
      },
    },
  });
}

export default async function ToursPage() {
  const tours = await getTours();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
            🗺️ Gestão de Tours
          </h1>
          <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            Gerencie todos os tours, preços e traduções
          </p>
        </div>
        <Link
          href="/tours/new"
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--brand-turquoise)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}
        >
          + Adicionar Tour
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {tours.map((tour) => (
          <div
            key={tour.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
                    {tour.titlePt}
                  </h3>
                  {tour.bestChoice && (
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
                      ⭐ Best Choice
                    </span>
                  )}
                  {tour.active ? (
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
                      Ativo
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: 'var(--gray-200)',
                        color: 'var(--gray-700)',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}
                    >
                      Inativo
                    </span>
                  )}
                </div>

                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {tour.descriptionPt.substring(0, 200)}...
                </p>

                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: 'var(--gray-600)' }}>Duração:</span>
                    <span style={{ fontWeight: '600', marginLeft: '0.5rem' }}>
                      {tour.durationHours}h
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-600)' }}>Grupo Máx:</span>
                    <span style={{ fontWeight: '600', marginLeft: '0.5rem' }}>
                      {tour.maxGroupSize}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-600)' }}>Reservas:</span>
                    <span style={{ fontWeight: '600', marginLeft: '0.5rem' }}>
                      {tour._count.bookings}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-600)' }}>Preços:</span>
                    <span style={{ fontWeight: '600', marginLeft: '0.5rem' }}>
                      {tour.seasonPrices.length} tiers
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/tours/${tour.id}`}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--brand-black)',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}
              >
                Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
