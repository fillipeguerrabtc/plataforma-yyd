import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getCalendarEvents(year: number, month: number) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const bookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ['confirmed', 'pending_payment'],
      },
    },
    include: {
      product: true,
      customer: true,
      guide: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  return bookings;
}

async function getGuides() {
  return await prisma.guide.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string };
}) {
  const now = new Date();
  const currentYear = parseInt(searchParams.year || now.getFullYear().toString());
  const currentMonth = parseInt(searchParams.month || now.getMonth().toString());

  const bookings = await getCalendarEvents(currentYear, currentMonth);
  const guides = await getGuides();

  // Calendar logic
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthName = firstDayOfMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Group bookings by day
  const bookingsByDay: { [key: number]: any[] } = {};
  bookings.forEach((booking) => {
    const day = new Date(booking.date).getDate();
    if (!bookingsByDay[day]) {
      bookingsByDay[day] = [];
    }
    bookingsByDay[day].push(booking);
  });

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
            📅 Calendário de Tours
          </h1>
          <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            Visualize e gerencie todos os tours agendados
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link
            href={`/calendar?year=${prevYear}&month=${prevMonth}`}
            style={{
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid var(--gray-300)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            ← Mês Anterior
          </Link>
          
          <span style={{ fontSize: '1.125rem', fontWeight: '600', textTransform: 'capitalize' }}>
            {monthName}
          </span>
          
          <Link
            href={`/calendar?year=${nextYear}&month=${nextMonth}`}
            style={{
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid var(--gray-300)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            Próximo Mês →
          </Link>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1rem' }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div
              key={day}
              style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--gray-700)',
                background: 'var(--gray-100)',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--gray-200)' }}>
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div
              key={`empty-${index}`}
              style={{
                minHeight: '120px',
                background: 'var(--gray-50)',
              }}
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayBookings = bookingsByDay[day] || [];
            const isToday =
              day === now.getDate() &&
              currentMonth === now.getMonth() &&
              currentYear === now.getFullYear();

            return (
              <div
                key={day}
                style={{
                  minHeight: '120px',
                  background: 'white',
                  padding: '0.5rem',
                  position: 'relative',
                  border: isToday ? '2px solid var(--brand-turquoise)' : 'none',
                }}
              >
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: isToday ? '700' : '600',
                    color: isToday ? 'var(--brand-turquoise)' : 'var(--gray-700)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {day}
                </div>

                {dayBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    style={{
                      background: booking.status === 'confirmed' ? 'var(--brand-turquoise)15' : 'var(--brand-gold)15',
                      border: `1px solid ${booking.status === 'confirmed' ? 'var(--brand-turquoise)' : 'var(--brand-gold)'}`,
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      marginBottom: '0.25rem',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '2px', color: 'var(--brand-black)' }}>
                      {booking.customer.name}
                    </div>
                    <div style={{ fontWeight: '500', marginBottom: '2px', fontSize: '0.7rem' }}>
                      {booking.product.titlePt.substring(0, 20)}...
                    </div>
                    <div style={{ color: 'var(--gray-600)' }}>
                      {booking.numberOfPeople} pessoa{booking.numberOfPeople > 1 ? 's' : ''}
                    </div>
                    {booking.guide ? (
                      <div style={{ color: 'var(--brand-turquoise)', fontSize: '0.7rem', marginTop: '2px' }}>
                        🚗 {booking.guide.name}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--brand-gold)', fontSize: '0.7rem', marginTop: '2px' }}>
                        ⚠️ Sem guia
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '2rem', background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          📋 Resumo do Mês
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Total de Tours</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
              {bookings.length}
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Confirmados</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--brand-turquoise)' }}>
              {bookings.filter((b) => b.status === 'confirmed').length}
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Sem Guia</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--brand-gold)' }}>
              {bookings.filter((b) => !b.guide).length}
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Guias Disponíveis</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
              {guides.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
