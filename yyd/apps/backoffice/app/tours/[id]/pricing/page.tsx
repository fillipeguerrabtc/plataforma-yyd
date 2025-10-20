import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PricingManager from './PricingManager';

async function getTourPricing(tourId: string) {
  const tour = await prisma.product.findUnique({
    where: { id: tourId },
    include: { seasonPrices: { orderBy: [{ season: 'asc' }, { minPeople: 'asc' }] } },
  });

  if (!tour) notFound();
  return { tour, prices: tour.seasonPrices };
}

export default async function TourPricingPage({ params }: { params: { id: string } }) {
  const { tour, prices } = await getTourPricing(params.id);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          💰 Pricing Sazonal - {tour.titlePt}
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          Configure os preços por temporada e número de pessoas
        </p>
      </div>

      <PricingManager tourId={params.id} initialPrices={prices} />
    </div>
  );
}
