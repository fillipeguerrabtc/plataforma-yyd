import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getGuides() {
  const guides = await prisma.guide.findMany({
    orderBy: { name: 'asc' },
    include: {
      bookings: {
        where: {
          date: { gte: new Date() },
          status: 'confirmed',
        },
        include: {
          product: true,
        },
      },
      _count: {
        select: { bookings: true },
      },
    },
  });

  return guides;
}

export default async function GuidesPage() {
  const guides = await getGuides();

  const activeGuides = guides.filter((g) => g.active);
  const inactiveGuides = guides.filter((g) => !g.active);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
            🚗 Gestão de Guias
          </h1>
          <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            Gerencie os guias turísticos e suas atribuições
          </p>
        </div>
        <Link
          href="/guides/new"
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--brand-turquoise)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}
        >
          + Adicionar Guia
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total de Guias" value={guides.length} color="var(--brand-black)" />
        <StatCard label="Guias Ativos" value={activeGuides.length} color="var(--brand-turquoise)" />
        <StatCard label="Guias Inativos" value={inactiveGuides.length} color="var(--gray-500)" />
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {guides.map((guide) => (
          <div
            key={guide.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              gap: '1.5rem',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: guide.photoUrl
                  ? `url(${guide.photoUrl}) center/cover`
                  : 'var(--gray-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                flexShrink: 0,
              }}
            >
              {!guide.photoUrl && '👤'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
                    {guide.name}
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
                    {guide.email} · {guide.phone}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {guide.active ? (
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
                  <Link
                    href={`/guides/${guide.id}`}
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

              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                    Idiomas
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {guide.languages.map((lang) => (
                      <span
                        key={lang}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: 'var(--gray-100)',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                    Total de Tours
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
                    {guide._count.bookings}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                    Próximos Tours
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--brand-turquoise)' }}>
                    {guide.bookings.length}
                  </div>
                </div>
              </div>

              {guide.bio && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
                    Bio
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>{guide.bio}</div>
                </div>
              )}

              {guide.bookings.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    🗓️ Próximos Tours Agendados:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {guide.bookings.slice(0, 3).map((booking: any) => (
                      <div
                        key={booking.id}
                        style={{
                          padding: '0.5rem',
                          background: 'var(--gray-50)',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>
                          {new Date(booking.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                        {' · '}
                        {booking.product.titlePt}
                        {' · '}
                        <span style={{ color: 'var(--gray-600)' }}>{booking.numberOfPeople} pessoas</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}
