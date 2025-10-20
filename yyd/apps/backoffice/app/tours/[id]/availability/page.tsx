import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import AvailabilityManager from './AvailabilityManager';

async function getTourAvailability(tourId: string) {
  const tour = await prisma.product.findUnique({
    where: { id: tourId },
    include: { availability: { orderBy: { date: 'asc' } } },
  });

  if (!tour) notFound();
  return { tour, availability: tour.availability };
}

export default async function TourAvailabilityPage({ params }: { params: { id: string } }) {
  const { tour, availability } = await getTourAvailability(params.id);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          📅 Disponibilidade & Blackout Dates - {tour.titlePt}
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          Gerencie datas bloqueadas e horários disponíveis
        </p>
      </div>

      <AvailabilityManager tourId={params.id} initialSlots={availability} />
    </div>
  );
}
