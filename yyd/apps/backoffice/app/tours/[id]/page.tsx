import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import TourForm from '@/components/TourForm';

async function getTour(id: string) {
  const tour = await prisma.product.findUnique({
    where: { id },
    include: {
      seasonPrices: true,
    },
  });

  if (!tour) {
    notFound();
  }

  return tour;
}

export default async function EditTourPage({ params }: { params: { id: string } }) {
  const tour = await getTour(params.id);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          ✏️ Editar Tour
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          Edite as informações do tour "{tour.titlePt}"
        </p>
      </div>

      <TourForm initialData={tour} />
    </div>
  );
}
