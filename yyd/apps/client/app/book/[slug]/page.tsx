import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import BookingFlow from '@/components/BookingFlow';

export default async function BookTourPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product.findUnique({
    where: {
      slug: params.slug,
      active: true,
    },
    include: {
      seasonPrices: {
        orderBy: { minPeople: 'asc' },
      },
      options: {
        orderBy: { id: 'asc' },
      },
      activities: {
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{product.titleEn}</h1>
            <p className="text-gray-600">{product.descriptionEn}</p>
          </div>

          <BookingFlow product={product} />
        </div>
      </main>
      <Footer />
    </>
  );
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true },
  });

  return products.map((product) => ({
    slug: product.slug,
  }));
}
