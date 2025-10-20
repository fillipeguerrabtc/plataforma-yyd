import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import { getPriceRange } from '@yyd/shared';

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      seasonPrices: true,
    },
    orderBy: { id: 'asc' },
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-gray-50 to-white py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl font-bold text-black mb-6 font-montserrat">
                Private Tuk Tuk Tours in<br />
                <span className="text-black">Sintra & Cascais</span>
              </h1>
              <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
                See the best of Sintra and Cascais with a local guide on a comfortable tuk tuk.
              </p>
              <p className="text-lg text-gray-500 mb-8">
                Personalized tours, no crowds, and the freedom to explore your way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="#tours"
                  className="btn-yyd-primary inline-block"
                >
                  Explore Our Tours
                </Link>
                <Link
                  href="#contact"
                  className="btn-yyd-secondary inline-block"
                >
                  Talk to Our Team
                </Link>
              </div>

              {/* Trust Badge */}
              <div className="mt-12 flex items-center justify-center gap-2">
                <div className="flex text-black">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-black font-semibold">257 reviews</span>
              </div>

              <div className="mt-4 text-gray-600">
                <span className="font-semibold">As seen on:</span> ABC Good Morning America
              </div>
            </div>
          </div>
        </section>

        {/* No Crowds Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-black mb-4 font-montserrat">
                No Crowds. No Stress. Just You and Sintra.
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Say goodbye to crowded buses and rigid schedules. Our private tuk tuk tours offer the freedom to explore Sintra & Cascais on your terms.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-black mb-2 font-montserrat">600+</div>
                <div className="text-gray-600">Happy Clients</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-black mb-2 font-montserrat">10+</div>
                <div className="text-gray-600">Years of Expertise</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-black mb-2 font-montserrat">2</div>
                <div className="text-gray-600">Professional Team Members</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-black mb-2 font-montserrat">257+</div>
                <div className="text-gray-600">5-star Reviews</div>
              </div>
            </div>
          </div>
        </section>

        {/* How We Simplify Your Experience */}
        <section className="py-16 bg-white" id="about">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-black text-center mb-12 font-montserrat">
              How We Simplify Your Experience
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="card-yyd p-6 overflow-hidden">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-black mb-2 font-montserrat">Personalized Itineraries</h3>
                <p className="text-gray-600">
                  Choose what you want to see. We'll design a tour around your interests and timing — no rigid plans, no rush.
                </p>
              </div>
              <div className="card-yyd p-6 overflow-hidden">
                <div className="text-3xl mb-4">👨‍🏫</div>
                <h3 className="text-xl font-bold text-black mb-2 font-montserrat">Local Expert Guides</h3>
                <p className="text-gray-600">
                  Our friendly, English-speaking guides know Sintra like no one else. Expect history, stories, and the best local tips.
                </p>
              </div>
              <div className="card-yyd p-6 overflow-hidden">
                <div className="text-3xl mb-4">🚗</div>
                <h3 className="text-xl font-bold text-black mb-2 font-montserrat">Spacious & Comfortable Tuk Tuks</h3>
                <p className="text-gray-600">
                  Travel with ease in our premium electric tuk tuks — perfect for exploring narrow streets while staying relaxed.
                </p>
              </div>
              <div className="card-yyd p-6 overflow-hidden">
                <div className="text-3xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-black mb-2 font-montserrat">Easy Booking & Support</h3>
                <p className="text-gray-600">
                  From the first message to the final goodbye, we're here to help. Booking is quick, and we answer fast.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tours Section */}
        <section className="py-16 bg-gray-50" id="tours">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-black text-center mb-4 font-montserrat">
              Choose Your Perfect Tuk Tuk Tour
            </h2>
            <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Whether you want to explore majestic palaces or ride along dramatic coastal roads, our tuk tuk tours offer the perfect match — from half-day highlights to full-day adventures.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {products.map((product) => {
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
                  <div
                    key={product.id}
                    className="card-yyd overflow-hidden relative"
                  >
                    {isBestChoice && (
                      <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded text-sm font-semibold z-10">
                        ⭐ Best Choice
                      </div>
                    )}
                    {isPremium && (
                      <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded text-sm font-semibold z-10">
                        💎 Premium
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-black mb-2 font-montserrat">
                        {product.titleEn}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {product.descriptionEn}
                      </p>
                      <div className="mb-4">
                        <span className="text-sm text-gray-500">Duration:</span>
                        <span className="text-lg font-semibold text-black ml-2">
                          {product.durationHours} hours
                        </span>
                      </div>

                      {priceRange && (
                        <div className="mb-4">
                          <span className="text-sm text-gray-500 block mb-1">Starting at</span>
                          <span className="text-3xl font-bold text-black">
                            €{priceRange.min}
                          </span>
                          {priceRange.min !== priceRange.max && (
                            <span className="text-gray-500 ml-2">- €{priceRange.max}</span>
                          )}
                        </div>
                      )}

                      <Link
                        href={`/tours/${product.slug}`}
                        className="btn-yyd-primary block text-center"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-white" id="contact">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-black text-center mb-4 font-montserrat">
              Ready to Plan Your Unforgettable Trip?
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Let's make your dream tour a reality. Whether you have questions or are ready to book, we're here to help you every step of the way.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-200">
                <div className="text-sm font-semibold text-black mb-2 uppercase">✓ Recommended</div>
                <h3 className="text-2xl font-bold text-black mb-2 font-montserrat">WhatsApp</h3>
                <p className="text-gray-600 mb-6">
                  Fastest way to reach us. Click below to start chatting now.
                </p>
                <a
                  href="http://wa.link/y0m3y9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Message Us on WhatsApp
                </a>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-200">
                <div className="text-sm font-semibold text-black mb-2 uppercase">✓ Recommended</div>
                <h3 className="text-2xl font-bold text-black mb-2 font-montserrat">Messenger</h3>
                <p className="text-gray-600 mb-6">
                  Prefer Facebook? We're available there too.
                </p>
                <a
                  href="https://www.m.me/1566043420168290"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  Message Us on Messenger
                </a>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-200">
                <div className="text-sm text-gray-500 mb-2 uppercase">Use as last option</div>
                <h3 className="text-2xl font-bold text-black mb-2 font-montserrat">Email</h3>
                <p className="text-gray-600 mb-6">
                  For detailed inquiries or special requests.
                </p>
                <a
                  href="mailto:info@yesyoudeserve.tours"
                  className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  Send An E-mail
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-black text-center mb-12 font-montserrat">
              Why Travelers Choose Yes, You Deserve!
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-black mb-2 font-montserrat">Only Private Tours</h3>
                <p className="text-gray-600">
                  No groups, no strangers. Just you and your guide.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-black mb-2 font-montserrat">Custom Planning</h3>
                <p className="text-gray-600">
                  We adapt the day to your rhythm and interests.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-xl font-semibold text-black mb-2 font-montserrat">Expert Guides</h3>
                <p className="text-gray-600">
                  Passionate locals trained to make you feel at home.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📸</div>
                <h3 className="text-xl font-semibold text-black mb-2 font-montserrat">Beautiful Photos Included</h3>
                <p className="text-gray-600">
                  Leave with stunning photos and memories captured during your adventure.
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
