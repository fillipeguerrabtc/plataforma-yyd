'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  locale: string;
  country: string | null;
  source: string | null;
  tags: string[];
  notes: string | null;
  totalBookings: number;
  totalSpent: number;
  lastBookingAt: Date | null;
  leadStatus: string;
  leadScore: number;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
  bookings: any[];
}

interface Message {
  id: string;
  content: string;
  direction: string;
  channel: string;
  sentAt: Date;
}

export default function CustomerTimeline({
  customer,
  messages,
}: {
  customer: Customer;
  messages: Message[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'timeline' | 'bookings' | 'info'>('timeline');

  const timelineEvents = [
    ...customer.bookings.map((b: any) => ({
      type: 'booking',
      date: new Date(b.date),
      data: b,
    })),
    ...messages.map((m) => ({
      type: 'message',
      date: new Date(m.sentAt),
      data: m,
    })),
    {
      type: 'created',
      date: new Date(customer.createdAt),
      data: customer,
    },
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const statusColors: Record<string, string> = {
    lead: '#9ca3af',
    qualified: '#3b82f6',
    customer: '#10b981',
    vip: '#f59e0b',
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <button
        onClick={() => router.back()}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: 'var(--gray-100)',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        ← Voltar
      </button>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--gray-200)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {customer.name}
            </h1>
            <p style={{ color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
              {customer.email} {customer.phone ? `• ${customer.phone}` : ''}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  background: statusColors[customer.leadStatus] || 'var(--gray-300)',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}
              >
                {customer.leadStatus.toUpperCase()}
              </span>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  background: 'var(--brand-turquoise)',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}
              >
                Score: {customer.leadScore}
              </span>
              {customer.tags.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: 'var(--gray-100)',
                    color: 'var(--gray-700)',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--brand-turquoise)' }}>
              €{Number(customer.totalSpent).toFixed(2)}
            </div>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {customer.totalBookings} reservas
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-200)' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
              PAÍS
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>
              {customer.country || '—'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
              IDIOMA
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>
              {customer.locale.toUpperCase()}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
              ORIGEM
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>
              {customer.source || '—'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
              ÚLTIMA RESERVA
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>
              {customer.lastBookingAt ? new Date(customer.lastBookingAt).toLocaleDateString('pt-PT') : '—'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('timeline')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'timeline' ? 'var(--brand-turquoise)' : 'var(--gray-100)',
            color: activeTab === 'timeline' ? 'white' : 'var(--gray-700)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          📅 Timeline ({timelineEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'bookings' ? 'var(--brand-turquoise)' : 'var(--gray-100)',
            color: activeTab === 'bookings' ? 'white' : 'var(--gray-700)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          🎫 Reservas ({customer.bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('info')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'info' ? 'var(--brand-turquoise)' : 'var(--gray-100)',
            color: activeTab === 'info' ? 'white' : 'var(--gray-700)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ℹ️ Informações
        </button>
      </div>

      {activeTab === 'timeline' && (
        <div style={{ position: 'relative', paddingLeft: '3rem' }}>
          <div
            style={{
              position: 'absolute',
              left: '1rem',
              top: 0,
              bottom: 0,
              width: '2px',
              background: 'var(--gray-200)',
            }}
          />
          {timelineEvents.map((event, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: '2rem' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-2rem',
                  width: '2rem',
                  height: '2rem',
                  background: event.type === 'booking' ? 'var(--brand-turquoise)' : event.type === 'message' ? '#3b82f6' : 'var(--gray-400)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  border: '3px solid white',
                }}
              >
                {event.type === 'booking' ? '🎫' : event.type === 'message' ? '💬' : '👤'}
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>
                    {event.type === 'booking'
                      ? `Reserva: ${event.data.product?.name || event.data.bookingNumber}`
                      : event.type === 'message'
                      ? `Mensagem via ${event.data.channel}`
                      : 'Cliente criado'}
                  </h3>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    {event.date.toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                {event.type === 'booking' && (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                      {event.data.numberOfPeople} pessoas • {new Date(event.data.date).toLocaleDateString('pt-PT')}
                    </p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                      Status: <span style={{ color: event.data.status === 'confirmed' ? '#10b981' : '#f59e0b' }}>{event.data.status}</span> • €{Number(event.data.priceEur).toFixed(2)}
                    </p>
                  </div>
                )}

                {event.type === 'message' && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    {event.data.content.substring(0, 150)}
                    {event.data.content.length > 150 ? '...' : ''}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {customer.bookings.map((booking: any) => (
            <div
              key={booking.id}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid var(--gray-200)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {booking.product?.name || 'Tour'}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    {booking.bookingNumber} • {new Date(booking.date).toLocaleDateString('pt-PT')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--brand-turquoise)' }}>
                    €{Number(booking.priceEur).toFixed(2)}
                  </div>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: booking.status === 'confirmed' ? '#10b981' : '#f59e0b',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)' }}>PESSOAS</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{booking.numberOfPeople}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)' }}>TEMPORADA</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{booking.season}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)' }}>GUIA</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{booking.guide?.name || '—'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'info' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Notas Internas</h2>
          <textarea
            defaultValue={customer.notes || ''}
            style={{
              width: '100%',
              minHeight: '150px',
              padding: '1rem',
              border: '1px solid var(--gray-300)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
            }}
            placeholder="Adicione notas sobre este cliente..."
          />
          <button
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'var(--brand-turquoise)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Salvar Notas
          </button>

          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem' }}>Histórico</h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
            <p>Criado em: {new Date(customer.createdAt).toLocaleString('pt-PT')}</p>
            <p style={{ marginTop: '0.5rem' }}>Última atualização: {new Date(customer.updatedAt).toLocaleString('pt-PT')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
