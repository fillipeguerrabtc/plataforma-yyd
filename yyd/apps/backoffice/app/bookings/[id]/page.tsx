import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AssignGuideForm from '@/components/AssignGuideForm';

async function getBooking(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      product: true,
      customer: true,
      guide: true,
      payments: true,
    },
  });

  if (!booking) {
    notFound();
  }

  return booking;
}

async function getAvailableGuides() {
  return await prisma.guide.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });
}

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const booking = await getBooking(params.id);
  const guides = await getAvailableGuides();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <Link
              href="/bookings"
              style={{
                padding: '0.5rem',
                background: 'var(--gray-200)',
                borderRadius: '6px',
                display: 'inline-flex',
              }}
            >
              ← Voltar
            </Link>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
              Reserva #{booking.bookingNumber}
            </h1>
          </div>
          <p style={{ color: 'var(--gray-600)' }}>
            Detalhes completos da reserva
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              📋 Informações da Reserva
            </h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <InfoRow label="Status" value={<StatusBadge status={booking.status} />} />
              <InfoRow
                label="Data do Tour"
                value={new Date(booking.date).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              />
              <InfoRow label="Horário" value={booking.startTime} />
              <InfoRow label="Número de Pessoas" value={booking.numberOfPeople} />
              <InfoRow
                label="Tour"
                value={
                  <div>
                    <div style={{ fontWeight: '600' }}>{booking.product.titlePt}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      {booking.product.categoryPt}
                    </div>
                  </div>
                }
              />
              <InfoRow
                label="Temporada"
                value={booking.season === 'high' ? 'Alta (Mai-Out)' : 'Baixa (Nov-Abr)'}
              />
              <InfoRow
                label="Valor Total"
                value={
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--brand-turquoise)' }}>
                    R${parseFloat(booking.priceEur.toString())}
                  </span>
                }
              />
            </div>

            {booking.specialRequests && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
                  Pedidos Especiais:
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                  {booking.specialRequests}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              👤 Informações do Cliente
            </h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <InfoRow label="Nome" value={booking.customer.name} />
              <InfoRow label="Email" value={booking.customer.email} />
              <InfoRow label="Telefone" value={booking.customer.phone || '-'} />
              <InfoRow label="WhatsApp" value={booking.customer.whatsapp || '-'} />
              <InfoRow label="País" value={booking.customer.country || '-'} />
              <InfoRow label="Idioma Preferido" value={booking.locale.toUpperCase()} />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <a
                href={`mailto:${booking.customer.email}`}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'var(--brand-turquoise)',
                  color: 'white',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                }}
              >
                📧 Enviar Email
              </a>
              {booking.customer.whatsapp && (
                <a
                  href={`https://wa.me/${booking.customer.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#25D366',
                    color: 'white',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
          </div>

          {booking.payments.length > 0 && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                💳 Pagamentos
              </h2>

              {booking.payments.map((payment: any) => (
                <div
                  key={payment.id}
                  style={{
                    padding: '1rem',
                    background: 'var(--gray-50)',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600' }}>
                      R${parseFloat(payment.amount.toString())}
                    </span>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        background:
                          payment.status === 'succeeded'
                            ? 'var(--brand-turquoise)15'
                            : 'var(--brand-gold)15',
                        color:
                          payment.status === 'succeeded'
                            ? 'var(--brand-turquoise)'
                            : 'var(--brand-gold)',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleString('pt-BR')
                      : 'Aguardando pagamento'}
                  </div>
                  {payment.stripePaymentIntent && (
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--gray-500)',
                        marginTop: '0.25rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      {payment.stripePaymentIntent}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', position: 'sticky', top: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              🚗 Guia Atribuído
            </h2>

            {booking.guide && (
              <div
                style={{
                  padding: '1rem',
                  background: 'var(--brand-turquoise)15',
                  border: '1px solid var(--brand-turquoise)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  {booking.guide.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                  {booking.guide.email}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                  {booking.guide.phone}
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {booking.guide.languages.map((lang: string) => (
                    <span
                      key={lang}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: 'white',
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
            )}

            <AssignGuideForm 
              bookingId={booking.id} 
              currentGuideId={booking.guideId} 
              guides={guides}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--gray-200)' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{label}:</span>
      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-800)', textAlign: 'right' }}>
        {value}
      </span>
    </div>
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
        padding: '0.5rem 1rem',
        background: colorScheme.bg,
        color: colorScheme.text,
        borderRadius: '999px',
        fontSize: '0.875rem',
        fontWeight: '600',
      }}
    >
      {status}
    </span>
  );
}
