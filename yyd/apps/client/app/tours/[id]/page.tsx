'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Product {
  id: string;
  nameEn: string;
  descriptionEn: string;
  tourType: string;
  durationHours: number;
  maxCapacity: number;
  imageUrl?: string;
  seasonPrices: Array<{
    season: string;
    priceEur: number;
  }>;
  activities: Array<{
    nameEn: string;
    descriptionEn: string;
    included: boolean;
  }>;
}

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tour, setTour] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState('low');

  useEffect(() => {
    fetchTour();
  }, [params.id]);

  const fetchTour = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (!response.ok) throw new Error('Tour not found');
      
      const data = await response.json();
      setTour(data.product);
      
      // Set default season based on current month
      const month = new Date().getMonth() + 1;
      if (month >= 5 && month <= 10) {
        setSelectedSeason('high');
      } else if (month === 12 || month === 1) {
        setSelectedSeason('peak');
      }
    } catch (error) {
      console.error('Error fetching tour:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPrice = () => {
    if (!tour) return 0;
    const seasonPrice = tour.seasonPrices.find(sp => sp.season === selectedSeason);
    return seasonPrice?.priceEur || 0;
  };

  const handleBookNow = () => {
    router.push(`/book/${params.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Tour not found</h1>
          <a href="/tours" className="text-black underline">Back to tours</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <a href="/" className="text-2xl font-bold">YYD</a>
              <nav className="flex gap-6">
                <a href="/tours" className="hover:underline">Tours</a>
                <a href="/login" className="hover:underline">Login</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        {tour.imageUrl && (
          <div className="w-full h-96 bg-gray-200">
            <img
              src={tour.imageUrl}
              alt={tour.nameEn}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Tour Info */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                {tour.tourType && (
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-medium rounded-full mb-4">
                    {tour.tourType.replace('-', ' ').toUpperCase()}
                  </span>
                )}
                <h1 className="text-4xl font-bold text-black mb-4">
                  {tour.nameEn}
                </h1>
                <div className="flex items-center gap-6 text-gray-600">
                  <span>⏱️ {tour.durationHours} hours</span>
                  <span>👥 Up to {tour.maxCapacity} people</span>
                  <span>🚗 Private tour</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black mb-4">About This Tour</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {tour.descriptionEn}
                </p>
              </div>

              {/* What's Included */}
              {tour.activities && tour.activities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-black mb-4">What's Included</h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <ul className="space-y-3">
                      {tour.activities
                        .filter(a => a.included)
                        .map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="text-green-600 mt-1">✓</span>
                            <div>
                              <p className="font-semibold text-black">{activity.nameEn}</p>
                              <p className="text-sm text-gray-600">{activity.descriptionEn}</p>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Optional Add-ons Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-black mb-2">Customize Your Experience</h3>
                <p className="text-sm text-gray-700">
                  Add wine tasting, traditional lunch, monument tickets, or Lisbon transfers to make your tour even more special!
                </p>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-white border-2 border-black rounded-lg p-6 shadow-lg">
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Starting from</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-black">
                        €{getCurrentPrice()}
                      </span>
                      <span className="text-gray-600">/ group</span>
                    </div>
                    
                    {/* Season selector */}
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(e.target.value)}
                      className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    >
                      <option value="low">Low Season (Nov-Apr)</option>
                      <option value="high">High Season (May-Oct)</option>
                      <option value="peak">Peak Season (Dec 23-Jan 1)</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleBookNow}
                      className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors"
                    >
                      Book Now
                    </button>
                    
                    <button
                      onClick={() => {
                        // Scroll to Aurora chat widget
                        const auroraWidget = document.querySelector('[title="Chat with Aurora"]') as HTMLElement;
                        if (auroraWidget) {
                          auroraWidget.click();
                        }
                      }}
                      className="w-full border-2 border-black text-black py-4 rounded-lg font-bold text-lg hover:bg-gray-50 transition-colors"
                    >
                      💬 Contact Us
                    </button>
                  </div>

                  {/* Trust Signals */}
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>Free cancellation up to 24h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>Instant confirmation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>Mobile voucher accepted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⭐</span>
                      <span>257 five-star reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Aurora Chat Widget */}
      
    </>
  );
}
