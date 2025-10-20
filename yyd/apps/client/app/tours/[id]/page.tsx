'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Tour {
  id: string;
  slug: string;
  titleEn: string;
  descriptionEn: string;
  categoryEn: string;
  durationHours: number;
  maxGroupSize: number;
  featuresEn: string[];
  excludedEn: string[];
  imageUrls: string[];
  bestChoice: boolean;
  seasonPrices: Array<{
    season: string;
    tier: string;
    priceEur: number;
    pricePerPerson: boolean;
    minPeople: number;
    maxPeople: number | null;
  }>;
  options: Array<{
    id: string;
    nameEn: string;
    descriptionEn: string;
  }>;
  activities: Array<{
    id: string;
    nameEn: string;
    descriptionEn: string;
  }>;
}

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  useEffect(() => {
    fetchTour();
  }, [params.id]);

  useEffect(() => {
    if (tour && selectedDate && numberOfPeople > 0) {
      calculatePrice();
    }
  }, [tour, selectedDate, numberOfPeople]);

  const fetchTour = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (!response.ok) throw new Error('Tour not found');
      
      const data = await response.json();
      setTour(data);
    } catch (error) {
      console.error('Error fetching tour:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!tour || !selectedDate) return;

    // Determine season from date
    const date = new Date(selectedDate);
    const month = date.getMonth() + 1;
    const season = (month >= 5 && month <= 10) ? 'high' : 'low';

    // Find matching price tier
    const matchingPrice = tour.seasonPrices.find(sp => 
      sp.season === season && 
      numberOfPeople >= sp.minPeople && 
      (sp.maxPeople === null || numberOfPeople <= sp.maxPeople)
    );

    if (matchingPrice) {
      const price = matchingPrice.pricePerPerson 
        ? matchingPrice.priceEur * numberOfPeople 
        : matchingPrice.priceEur;
      setCalculatedPrice(price);
    }
  };

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleBooking = async () => {
    if (!tour || !selectedDate || numberOfPeople < 1) {
      alert('Please select a date and number of people');
      return;
    }

    // Navigate to book page with pre-filled data
    const params = new URLSearchParams({
      date: selectedDate,
      people: numberOfPeople.toString(),
      option: selectedOption || '',
      activities: selectedActivities.join(','),
    });
    
    router.push(`/book/${tour.slug}?${params.toString()}`);
  };

  const getMinPrice = () => {
    if (!tour || tour.seasonPrices.length === 0) return 0;
    return Math.min(...tour.seasonPrices.map(sp => Number(sp.priceEur)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1FB7C4] border-t-transparent"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Tour not found</h1>
          <button 
            onClick={() => router.push('/tours')}
            className="btn-yyd"
          >
            Back to Tours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button onClick={() => router.push('/')} className="text-2xl font-bold font-greatVibes">
              Yes, you deserve.
            </button>
            <nav className="flex gap-6">
              <button onClick={() => router.push('/tours')} className="hover:text-[#1FB7C4] transition-colors">
                ← Voltar
              </button>
              <button onClick={() => router.push('/')} className="btn-yyd-small">
                Home
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      {tour.imageUrls && tour.imageUrls.length > 0 && (
        <div className="w-full h-[400px] bg-gray-200 relative">
          <img
            src={tour.imageUrls[0]}
            alt={tour.titleEn}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&h=400&fit=crop';
            }}
          />
          {tour.bestChoice && (
            <div className="absolute top-6 right-6 bg-gradient-to-r from-[#1FB7C4] to-[#37C8C4] text-white px-6 py-3 rounded-full font-bold shadow-lg">
              ⭐ BEST CHOICE
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Tour Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tour Header */}
            <div>
              <div className="flex items-center gap-3 mb-4 text-gray-600">
                <span className="flex items-center gap-1">⏱️ {tour.durationHours} hours</span>
                <span className="flex items-center gap-1">👥 Up to {tour.maxGroupSize} people</span>
                <span className="flex items-center gap-1">🚗 Private tour</span>
              </div>
              <h1 className="text-4xl font-bold text-black mb-4 font-montserrat">
                {tour.titleEn}
              </h1>
            </div>

            {/* About This Tour */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-4 font-montserrat">About This Tour</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {tour.descriptionEn}
              </p>
            </div>

            {/* What's Included */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-4 font-montserrat">What's Included</h2>
              <div className="card-yyd p-6">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tour.featuresEn.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-[#1FB7C4] mt-1 text-xl">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* What's NOT Included */}
            {tour.excludedEn && tour.excludedEn.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-4 font-montserrat">Not Included</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <ul className="space-y-2">
                    {tour.excludedEn.map((excluded, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-gray-400 mt-1">✗</span>
                        <span className="text-gray-600">{excluded}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tour Options */}
            {tour.options && tour.options.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-4 font-montserrat">Choose Your Experience</h2>
                <div className="space-y-4">
                  {tour.options.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedOption(option.id)}
                      className={`card-yyd p-6 cursor-pointer transition-all ${
                        selectedOption === option.id 
                          ? 'border-[#1FB7C4] border-2 bg-[#1FB7C4]/5' 
                          : 'hover:border-[#1FB7C4]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          checked={selectedOption === option.id}
                          onChange={() => setSelectedOption(option.id)}
                          className="mt-1 w-5 h-5 text-[#1FB7C4] focus:ring-[#1FB7C4]"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-black mb-2">{option.nameEn}</h3>
                          <p className="text-gray-600">{option.descriptionEn}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activities */}
            {tour.activities && tour.activities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-4 font-montserrat">Available Activities</h2>
                <p className="text-gray-600 mb-4">Select the activities you'd like to include in your tour:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tour.activities.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => handleActivityToggle(activity.id)}
                      className={`card-yyd p-4 cursor-pointer transition-all ${
                        selectedActivities.includes(activity.id) 
                          ? 'border-[#1FB7C4] border-2 bg-[#1FB7C4]/5' 
                          : 'hover:border-[#1FB7C4]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedActivities.includes(activity.id)}
                          onChange={() => handleActivityToggle(activity.id)}
                          className="mt-1 w-5 h-5 text-[#1FB7C4] focus:ring-[#1FB7C4] rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-black mb-1">{activity.nameEn}</h4>
                          <p className="text-sm text-gray-600">{activity.descriptionEn}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="card-yyd p-6 border-2 shadow-xl">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Starting from</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-black">
                      €{getMinPrice()}
                    </span>
                    <span className="text-gray-600">/ group</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Price varies by season. Select your date to see the exact price.
                  </p>
                </div>

                {/* Booking Form */}
                <div className="space-y-4">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Select Date *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1FB7C4] focus:outline-none"
                    />
                  </div>

                  {/* Number of People */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Number of People *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={tour.maxGroupSize}
                      value={numberOfPeople}
                      onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1FB7C4] focus:outline-none"
                    />
                  </div>

                  {/* Calculated Price Display */}
                  {selectedDate && calculatedPrice > 0 && (
                    <div className="bg-gradient-to-r from-[#1FB7C4]/10 to-[#37C8C4]/10 border-2 border-[#1FB7C4] rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Price</p>
                      <p className="text-3xl font-bold text-black">€{calculatedPrice.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        For {numberOfPeople} {numberOfPeople === 1 ? 'person' : 'people'} on {new Date(selectedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={handleBooking}
                    disabled={!selectedDate || numberOfPeople < 1}
                    className="btn-yyd w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment →
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-500">or</p>
                  </div>

                  <button
                    onClick={() => {
                      const auroraWidget = document.querySelector('[title="Chat with Aurora"]') as HTMLElement;
                      if (auroraWidget) auroraWidget.click();
                    }}
                    className="w-full border-2 border-black text-black py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    💬 Contact Us
                  </button>
                </div>

                {/* Trust Signals */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-[#1FB7C4]">✓</span>
                    <span>Free cancellation up to 24h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1FB7C4]">✓</span>
                    <span>Instant confirmation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1FB7C4]">✓</span>
                    <span>Mobile voucher accepted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1FB7C4]">⭐</span>
                    <span>257 five-star reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
