import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import { getPriceRange } from '@yyd/shared';

export default async function TourDetailPage({
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

  const priceRange = getPriceRange(
    product.seasonPrices.map((sp) => ({
      season: sp.season as 'low' | 'high',
      tier: sp.tier,
      minPeople: sp.minPeople,
      maxPeople: sp.maxPeople,
      priceEur: sp.priceEur,
      pricePerPerson: sp.pricePerPerson,
    }))
  );

  const isBestChoice = product.slug === 'personalized-full-day-tour';
  const isPremium = product.slug === 'all-inclusive-experience';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {isBestChoice && (
                <div className="inline-block bg-brand-turquoise text-white px-4 py-2 rounded-lg mb-4 font-semibold">
                  ⭐ Best Choice
                </div>
              )}
              {isPremium && (
                <div className="inline-block bg-brand-gold text-white px-4 py-2 rounded-lg mb-4 font-semibold">
                  💎 Premium Experience
                </div>
              )}

              <h1 className="text-5xl sm:text-6xl font-bold mb-6">
                {product.titleEn}
              </h1>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                {product.descriptionEn}
              </p>

              {priceRange && (
                <div className="text-3xl font-bold text-brand-black mb-8">
                  Starting at €{priceRange.min}
                  {priceRange.min !== priceRange.max && ` - €${priceRange.max}`}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`/book/${product.slug}`}
                  className="bg-brand-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition text-lg"
                >
                  📅 Book Online Now
                </a>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center text-sm">
                <span className="text-gray-600">Or book via chat:</span>
                <a
                  href="http://wa.link/y0m3y9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline font-semibold"
                >
                  📱 WhatsApp
                </a>
                <span className="hidden sm:inline text-gray-400">|</span>
                <a
                  href="https://www.m.me/1566043420168290"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  💬 Messenger
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Tour Details */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column - What's Included */}
            <div>
              <h2 className="text-3xl font-bold mb-6">What's Included</h2>
              
              {product.activities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Activities & Places</h3>
                  <ul className="space-y-3">
                    {product.activities.map((activity) => (
                      <li key={activity.id} className="flex items-start">
                        <span className="text-brand-turquoise mr-3 text-xl">✓</span>
                        <div>
                          <strong>{activity.nameEn}</strong>
                          {activity.descriptionEn && (
                            <p className="text-gray-600 text-sm">{activity.descriptionEn}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.options.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Tour Options</h3>
                  <ul className="space-y-3">
                    {product.options.map((option) => (
                      <li key={option.id} className="flex items-start">
                        <span className="text-brand-gold mr-3 text-xl">★</span>
                        <div>
                          <strong>{option.nameEn}</strong>
                          {option.descriptionEn && (
                            <p className="text-gray-600 text-sm">{option.descriptionEn}</p>
                          )}
                          {option.priceEur > 0 && (
                            <p className="text-brand-black font-semibold mt-1">
                              +€{option.priceEur}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column - Tour Info */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Tour Information</h2>
              
              <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-semibold">Duration:</span>
                  <span>{product.durationHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Language:</span>
                  <span>English, Portuguese, Spanish</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Vehicle:</span>
                  <span>Premium Electric Tuk Tuk</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Group Type:</span>
                  <span>Private Tour Only</span>
                </div>
              </div>

              <div className="mt-8 p-6 border-2 border-brand-turquoise rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Pricing Information</h3>
                <p className="text-gray-600 mb-4">
                  Prices vary according to date and number of people.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>📅 <strong>Low Season</strong> (Nov-Apr): Lower rates</li>
                  <li>☀️ <strong>High Season</strong> (May-Oct + Dec 23-Jan 1): Premium rates</li>
                  <li>👥 Group discounts available for larger parties</li>
                </ul>
                
                {priceRange && (
                  <div className="mt-6 bg-brand-black text-white p-4 rounded-lg text-center">
                    <div className="text-sm uppercase tracking-wide mb-2">Starting From</div>
                    <div className="text-4xl font-bold">€{priceRange.min}</div>
                    {priceRange.min !== priceRange.max && (
                      <div className="text-sm mt-2 text-gray-300">
                        Up to €{priceRange.max}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-brand-black text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Experience This Tour?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Contact us now to check availability and book your unforgettable adventure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="http://wa.link/y0m3y9"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                📱 WhatsApp (Recommended)
              </a>
              <a
                href="https://www.m.me/1566043420168290"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                💬 Facebook Messenger
              </a>
              <a
                href="mailto:info@yesyoudeserve.tours"
                className="bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                📧 Email
              </a>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-12">
              Why Choose Yes, You Deserve!
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="font-semibold mb-2">Only Private Tours</h3>
                <p className="text-gray-600 text-sm">
                  No groups, no strangers. Just you and your guide.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-semibold mb-2">Custom Planning</h3>
                <p className="text-gray-600 text-sm">
                  We adapt the day to your rhythm and interests.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="font-semibold mb-2">Expert Guides</h3>
                <p className="text-gray-600 text-sm">
                  Passionate locals trained to make you feel at home.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📸</div>
                <h3 className="font-semibold mb-2">Photos Included</h3>
                <p className="text-gray-600 text-sm">
                  Beautiful photos and memories captured during your adventure.
                </p>
              </div>
            </div>
          </div>
        </section>
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
