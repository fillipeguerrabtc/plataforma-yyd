'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Tour {
  id: string;
  slug: string;
  titleEn: string;
  titlePt: string;
  titleEs: string;
  descriptionEn: string;
  descriptionPt: string;
  descriptionEs: string;
  imageUrls: string[];
  durationHours: number;
  maxGroupSize: number;
  seasonPrices: Array<{
    season: string;
    priceEur: number;
    pricePerPerson: boolean;
    minPeople: number;
    maxPeople: number | null;
  }>;
}

export default function ToursPage() {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTours();
  }, []);

  async function fetchTours() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch tours');
      const data = await response.json();
      setTours(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getMinPrice(tour: Tour): number {
    if (tour.seasonPrices.length === 0) return 0;
    return Math.min(...tour.seasonPrices.map(sp => parseFloat(sp.priceEur.toString())));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37C8C4] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#37C8C4] to-[#23C0E3] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Pacifico, cursive' }}>
            Yes, you deserve.
          </h1>
          <p className="text-xl text-white/90">Premium Electric Tuk-Tuk Tours • Sintra & Cascais</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover Our Tours</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience unforgettable journeys through Sintra and Cascais in our eco-friendly electric tuk-tuks.
            Featured on ABC Good Morning America with 200+ 5-star reviews.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {tours.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tours available</h3>
            <p className="text-gray-600">Check back soon for our amazing experiences!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <div
                key={tour.id}
                onClick={() => router.push(`/tours/${tour.slug}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              >
                {tour.imageUrls?.[0] && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={tour.imageUrls[0]}
                      alt={tour.titleEn}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {tour.titleEn}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {tour.descriptionEn}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <span className="mr-2">⏱️</span>
                      {tour.durationHours}h
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">👥</span>
                      Up to {tour.maxGroupSize}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <span className="text-sm text-gray-500">From</span>
                      <div className="text-2xl font-bold text-[#37C8C4]">
                        €{getMinPrice(tour)}
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-[#E9C46A] text-gray-900 rounded-lg hover:bg-[#ddb860] transition font-semibold">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Pacifico, cursive' }}>
                Yes, you deserve.
              </h3>
              <p className="text-gray-400">Premium electric tuk-tuk tours in Sintra & Cascais, Portugal</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/tours" className="hover:text-white">Tours</a></li>
                <li><a href="/portal" className="hover:text-white">My Bookings</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">WhatsApp: +351 XXX XXX XXX</p>
              <p className="text-gray-400">Email: info@yesyoudeserve.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Yes You Deserve. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
