import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ActivityManager from './ActivityManager';

async function getTourActivities(tourId: string) {
  const tour = await prisma.product.findUnique({
    where: { id: tourId },
    include: { activities: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!tour) notFound();
  return { tour, activities: tour.activities };
}

export default async function TourActivitiesPage({ params }: { params: { id: string } }) {
  const { tour, activities } = await getTourActivities(params.id);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          🎯 Atividades Opcionais - {tour.titlePt}
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          Gerencie as atividades que os clientes podem adicionar a este tour
        </p>
      </div>

      <ActivityManager tourId={params.id} initialActivities={activities} />
    </div>
  );
}
