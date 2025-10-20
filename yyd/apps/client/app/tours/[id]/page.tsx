'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';

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

const EXCLUDED_ITEMS_PRICES: Record<string, number> = {
  lunch: 20,
  monument_tickets: 25,
  wine_tasting: 24,
  transfer_service: 15,
};

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedExcludedItems, setSelectedExcludedItems] = useState<string[]>([]);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  useEffect(() => {
    fetchTour();
  }, [params.id]);

  useEffect(() => {
    if (tour && selectedDate && numberOfPeople > 0) {
      calculatePrice();
    }
  }, [tour, selectedDate, numberOfPeople, selectedExcludedItems]);

  useEffect(() => {
    if (tour && selectedOption) {
      setSelectedActivities([]);
    }
  }, [selectedOption]);

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

    const date = new Date(selectedDate);
    const month = date.getMonth() + 1;
    const season = (month >= 5 && month <= 10) ? 'high' : 'low';

    const matchingPrice = tour.seasonPrices.find(sp => 
      sp.season === season && 
      numberOfPeople >= sp.minPeople && 
      (sp.maxPeople === null || numberOfPeople <= sp.maxPeople)
    );

    if (matchingPrice) {
      let price = matchingPrice.pricePerPerson 
        ? matchingPrice.priceEur * numberOfPeople 
        : matchingPrice.priceEur;
      
      selectedExcludedItems.forEach(item => {
        const itemKey = item.toLowerCase().replace(/\(.*?\)/g, '').trim().replace(/\s+/g, '_') as keyof typeof EXCLUDED_ITEMS_PRICES;
        const itemPrice = EXCLUDED_ITEMS_PRICES[itemKey];
        if (itemPrice) {
          price += itemPrice * numberOfPeople;
        }
      });
      
      setCalculatedPrice(price);
    }
  };

  const handleActivityToggle = (activityId: string) => {
    if (!canSelectActivities()) return;
    
    const maxActivities = getMaxActivities();
    
    setSelectedActivities(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else {
        if (prev.length >= maxActivities) {
          return prev;
        }
        return [...prev, activityId];
      }
    });
  };

  const handleExcludedItemToggle = (item: string) => {
    setSelectedExcludedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleBooking = async () => {
    if (!tour || !selectedDate || numberOfPeople < 1) {
      alert('Please select a date and number of people');
      return;
    }

    const params = new URLSearchParams({
      date: selectedDate,
      people: numberOfPeople.toString(),
      option: selectedOption || '',
      activities: selectedActivities.join(','),
      excluded: selectedExcludedItems.join(','),
    });
    
    router.push(`/book/${tour.slug}?${params.toString()}`);
  };

  const getMinPrice = () => {
    if (!tour || tour.seasonPrices.length === 0) return 0;
    return Math.min(...tour.seasonPrices.map(sp => Number(sp.priceEur)));
  };

  const isHalfDayTour = () => {
    return tour?.slug.includes('half-day') || tour?.durationHours === 4;
  };

  const isFullDayTour = () => {
    return tour?.slug.includes('full-day') && tour?.durationHours === 8 && !tour?.slug.includes('all-inclusive');
  };

  const isAllInclusive = () => {
    return tour?.slug.includes('all-inclusive');
  };

  const canSelectActivities = () => {
    if (isAllInclusive()) return false;
    if (isFullDayTour()) return true;
    if (isHalfDayTour()) return !!selectedOption;
    return false;
  };

  const getMaxActivities = () => {
    if (isHalfDayTour()) {
      const option1 = tour?.options.find((_, idx) => idx === 0);
      const option2 = tour?.options.find((_, idx) => idx === 1);
      
      if (selectedOption === option1?.id) return 1;
      if (selectedOption === option2?.id) return 3;
    }
    
    if (isFullDayTour()) return 3;
    
    return 0;
  };

  const showExcludedAsOptionals = () => {
    return isHalfDayTour() || isFullDayTour();
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
      <>
        <Header />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4">Tour not found</h1>
            <button 
              onClick={() => router.push('/tours')}
              className="btn-yyd-primary"
            >
              Back to Tours
            </button>
          </div>
        </div>
      </>
    );
  }

  const maxActivities = getMaxActivities();
  const activitiesHelperText = () => {
    if (isHalfDayTour()) {
      if (selectedOption === tour?.options[0]?.id) {
        return 'Select 1 activity to complement your monument visit';
      }
      if (selectedOption === tour?.options[1]?.id) {
        return 'Select up to 3 activities for your scenic route';
      }
      return '';
    }
    if (isFullDayTour()) {
      return 'Select up to 3 activities for your full-day experience';
    }
    return '';
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative bg-white">
          {tour.imageUrls && tour.imageUrls.length > 0 && (
            <div className="w-full h-[60vh] max-h-[500px] bg-gray-200 relative overflow-hidden">
              <img
                src={tour.imageUrls[0]}
                alt={tour.titleEn}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&h=600&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              {tour.bestChoice && (
                <div className="absolute top-8 right-8 bg-gradient-to-r from-[#1FB7C4] to-[#16A2B2] text-white px-6 py-3 rounded-full font-bold shadow-xl font-montserrat">
                  ⭐ BEST CHOICE
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-4 text-white/90 text-sm font-medium">
                  <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    ⏱️ {tour.durationHours} hours
                  </span>
                  <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    👥 Up to {tour.maxGroupSize} people
                  </span>
                  <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    🚗 Private tour
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-montserrat">
                  {tour.titleEn}
                </h1>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Tour Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* About This Tour */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-black mb-4 font-montserrat">About This Tour</h2>
                <p className="text-gray-700 leading-relaxed text-base">
                  {tour.descriptionEn}
                </p>
              </div>

              {/* What's Included */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-black mb-6 font-montserrat">What's Included</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tour.featuresEn.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-[#1FB7C4] mt-0.5 text-xl flex-shrink-0">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What's NOT Included / Optional Add-ons */}
              {tour.excludedEn && tour.excludedEn.length > 0 && (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-black mb-4 font-montserrat">
                    {showExcludedAsOptionals() ? 'Optional Add-ons' : 'Not Included'}
                  </h2>
                  
                  {showExcludedAsOptionals() ? (
                    <>
                      <p className="text-gray-600 mb-6 text-sm">
                        The following items are not included in the base price. You can add them to your booking:
                      </p>
                      <div className="space-y-3">
                        {tour.excludedEn.map((excluded, idx) => {
                          const itemKey = excluded.toLowerCase().replace(/\(.*?\)/g, '').trim().replace(/\s+/g, '_') as keyof typeof EXCLUDED_ITEMS_PRICES;
                          const itemPrice = EXCLUDED_ITEMS_PRICES[itemKey];
                          
                          return (
                            <div
                              key={idx}
                              onClick={() => handleExcludedItemToggle(excluded)}
                              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                selectedExcludedItems.includes(excluded)
                                  ? 'border-[#1FB7C4] bg-[#1FB7C4]/5'
                                  : 'border-gray-200 hover:border-[#1FB7C4]/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedExcludedItems.includes(excluded)}
                                  onChange={() => handleExcludedItemToggle(excluded)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-5 h-5 text-[#1FB7C4] focus:ring-[#1FB7C4] rounded cursor-pointer"
                                />
                                <div className="flex-1 flex items-center justify-between">
                                  <span className="text-gray-700 font-medium">{excluded}</span>
                                  {itemPrice && (
                                    <span className="text-[#1FB7C4] font-bold text-sm">
                                      +€{itemPrice}/person
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <ul className="space-y-2">
                      {tour.excludedEn.map((excluded, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-gray-400 mt-1">✗</span>
                          <span className="text-gray-600">{excluded}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Tour Options */}
              {tour.options && tour.options.length > 0 && !isAllInclusive() && (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-black mb-4 font-montserrat">Choose Your Experience</h2>
                  <p className="text-gray-600 mb-6 text-sm">
                    {isHalfDayTour() && 'Select how you want to explore Sintra on your half-day tour:'}
                  </p>
                  <div className="space-y-3">
                    {tour.options.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => setSelectedOption(option.id)}
                        className={`border-2 rounded-lg p-5 cursor-pointer transition-all ${
                          selectedOption === option.id 
                            ? 'border-[#1FB7C4] bg-[#1FB7C4]/5' 
                            : 'border-gray-200 hover:border-[#1FB7C4]/50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="radio"
                            checked={selectedOption === option.id}
                            onChange={() => setSelectedOption(option.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-5 h-5 text-[#1FB7C4] focus:ring-[#1FB7C4] cursor-pointer"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-black mb-2">{option.nameEn}</h3>
                            <p className="text-gray-600 text-sm">{option.descriptionEn}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities */}
              {tour.activities && tour.activities.length > 0 && !isAllInclusive() && (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-black mb-4 font-montserrat">Available Activities</h2>
                  {activitiesHelperText() && (
                    <p className="text-gray-600 mb-6 text-sm">
                      {activitiesHelperText()}
                      {maxActivities > 0 && canSelectActivities() && (
                        <span className="font-semibold ml-1">
                          ({selectedActivities.length}/{maxActivities} selected)
                        </span>
                      )}
                    </p>
                  )}
                  {isHalfDayTour() && !selectedOption && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <p className="text-yellow-800 text-sm font-medium">
                        ⚠️ Please select an experience option above first to choose activities
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tour.activities.map((activity) => {
                      const isSelected = selectedActivities.includes(activity.id);
                      const isDisabled = !canSelectActivities() || 
                        (!isSelected && selectedActivities.length >= maxActivities);
                      
                      return (
                        <div
                          key={activity.id}
                          onClick={() => !isDisabled && handleActivityToggle(activity.id)}
                          className={`border-2 rounded-lg p-4 transition-all ${
                            isDisabled 
                              ? 'opacity-50 cursor-not-allowed border-gray-200' 
                              : 'cursor-pointer'
                          } ${
                            isSelected 
                              ? 'border-[#1FB7C4] bg-[#1FB7C4]/5' 
                              : 'border-gray-200 hover:border-[#1FB7C4]/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => !isDisabled && handleActivityToggle(activity.id)}
                              onClick={(e) => e.stopPropagation()}
                              disabled={isDisabled}
                              className="mt-1 w-5 h-5 text-[#1FB7C4] focus:ring-[#1FB7C4] rounded cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-black mb-1 text-sm">{activity.nameEn}</h4>
                              <p className="text-xs text-gray-600">{activity.descriptionEn}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Starting from</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-black font-montserrat">
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
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Select Date *
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1FB7C4] focus:outline-none transition-colors"
                      />
                    </div>

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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1FB7C4] focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Calculated Price Display */}
                    {selectedDate && calculatedPrice > 0 && (
                      <div className="bg-gradient-to-br from-[#1FB7C4]/10 to-[#16A2B2]/5 border-2 border-[#1FB7C4] rounded-xl p-5">
                        <p className="text-sm text-gray-700 font-medium mb-2">Total Price</p>
                        <p className="text-4xl font-bold text-black font-montserrat">€{calculatedPrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-600 mt-2">
                          For {numberOfPeople} {numberOfPeople === 1 ? 'person' : 'people'} on {new Date(selectedDate).toLocaleDateString()}
                        </p>
                        {selectedExcludedItems.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#1FB7C4]/30">
                            <p className="text-xs text-gray-600 font-medium mb-1">Includes add-ons:</p>
                            {selectedExcludedItems.map((item, idx) => (
                              <p key={idx} className="text-xs text-gray-600">• {item}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleBooking}
                      disabled={!selectedDate || numberOfPeople < 1}
                      className="btn-yyd-primary w-full text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Payment →
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-500">or</span>
                      </div>
                    </div>

                    <a
                      href="https://wa.me/14155238886"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-yyd-whatsapp w-full justify-center"
                    >
                      💬 Talk With A Human
                    </a>
                  </div>

                  {/* Trust Signals */}
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
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
    </>
  );
}
