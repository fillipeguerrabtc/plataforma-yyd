'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

interface TourAddon {
  id: string;
  code: string;
  nameEn: string;
  descriptionEn: string;
  priceEur: number;
  priceType: string;
  category: string;
  imageUrl?: string;
}

export default function BookTourPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [tour, setTour] = useState<any>(null);
  const [addons, setAddons] = useState<TourAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    startTime: '09:00',
    numberOfPeople: 2,
    season: 'low',
    pickupLocation: '',
    specialRequests: '',
  });
  
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, [params.id]);

  // Read query parameters and populate form
  useEffect(() => {
    if (!searchParams) return;
    
    const date = searchParams.get('date');
    const people = searchParams.get('people');
    const excluded = searchParams.get('excluded');
    
    if (date) {
      setFormData(prev => ({ 
        ...prev, 
        date,
        numberOfPeople: people ? parseInt(people) : 2,
      }));
    }
    
    // Map excluded items to addon codes
    if (excluded && addons.length > 0) {
      const excludedItems = excluded.split(',').filter(Boolean);
      const addonMap: Record<string, boolean> = {};
      
      excludedItems.forEach(item => {
        const itemLower = item.toLowerCase();
        if (itemLower.includes('wine')) {
          addonMap['wine_tasting'] = true;
        }
        if (itemLower.includes('transfer')) {
          addonMap['transfer_service'] = true;
        }
        if (itemLower.includes('lunch')) {
          addonMap['lunch'] = true;
        }
        if (itemLower.includes('monument')) {
          addonMap['monument_tickets'] = true;
        }
      });
      
      setSelectedAddons(addonMap);
    }
  }, [searchParams, addons]);

  // Update season whenever date changes
  useEffect(() => {
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const month = selectedDate.getMonth() + 1;
      let season = 'low';
      if (month >= 5 && month <= 10) season = 'high';
      if (month === 12 || month === 1) season = 'peak';
      
      setFormData(prev => ({ ...prev, season }));
    }
  }, [formData.date]);

  const fetchData = async () => {
    try {
      const [tourRes, addonsRes] = await Promise.all([
        fetch(`/api/products/${params.id}`),
        fetch(`/api/tour-addons`),
      ]);

      const tourData = await tourRes.json();
      const addonsData = await addonsRes.json();

      setTour(tourData);
      setAddons(addonsData.addons || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAddon = (addonCode: string) => {
    setSelectedAddons(prev => ({
      ...prev,
      [addonCode]: !prev[addonCode],
    }));
  };

  const getBasePrice = () => {
    if (!tour) return 0;
    
    const seasonPrice = tour.seasonPrices?.find((sp: any) => 
      sp.season === formData.season &&
      formData.numberOfPeople >= sp.minPeople &&
      (sp.maxPeople === null || formData.numberOfPeople <= sp.maxPeople)
    );
    
    if (!seasonPrice) return 0;
    
    return seasonPrice.pricePerPerson 
      ? seasonPrice.priceEur * formData.numberOfPeople 
      : seasonPrice.priceEur;
  };

  const calculateTotal = () => {
    if (!tour) return 0;

    let total = getBasePrice();

    // Add-ons
    addons.forEach(addon => {
      if (selectedAddons[addon.code]) {
        if (addon.priceType === 'per_person') {
          total += addon.priceEur * formData.numberOfPeople;
        } else {
          total += addon.priceEur;
        }
      }
    });

    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // 1. Create or get customer
      const customerRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          locale: 'en',
        }),
      });

      const customerData = await customerRes.json();
      const customerId = customerData.customer.id;

      // 2. Create booking
      const selectedAddonsList = addons
        .filter(addon => selectedAddons[addon.code])
        .map(addon => ({
          addonId: addon.id,
          quantity: addon.priceType === 'per_person' ? formData.numberOfPeople : 1,
        }));

      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          productId: params.id,
          date: formData.date,
          startTime: formData.startTime,
          numberOfPeople: formData.numberOfPeople,
          season: formData.season,
          pickupLocation: formData.pickupLocation,
          specialRequests: formData.specialRequests,
          locale: 'en',
          addons: selectedAddonsList,
        }),
      });

      if (!bookingRes.ok) {
        const errorData = await bookingRes.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const bookingData = await bookingRes.json();
      const bookingId = bookingData.booking?.id;
      
      if (!bookingId) {
        throw new Error('Booking ID not received from server');
      }

      // 3. Redirect to checkout page with Stripe Elements
      const totalPrice = calculateTotal();
      router.push(`/checkout?bookingId=${bookingId}&amount=${totalPrice}`);
      setProcessing(false);

    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <a href="/" className="text-2xl font-bold">YYD</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <a href={`/tours/${params.id}`} className="text-black hover:underline">
            ← Back to tour
          </a>
        </div>

        <h1 className="text-3xl font-bold text-black mb-8">Book Your Tour</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">Your Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* Tour Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">Tour Details</h2>
                
                {/* Selected date and people from previous page */}
                {formData.date && (
                  <div className="mb-4 p-4 bg-[#1FB7C4]/10 border border-[#1FB7C4] rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Tour Date:</span> {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-semibold">Group Size:</span> {formData.numberOfPeople} {formData.numberOfPeople === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                )}
                
                <input type="hidden" value={formData.date} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <select
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1FB7C4]"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pickupLocation}
                      onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
                      placeholder="Hotel name or address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1FB7C4]"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                    placeholder="Dietary restrictions, accessibility needs, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Add-ons */}
              {addons.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-black mb-4">Customize Your Experience</h2>
                  <div className="space-y-4">
                    {addons.map(addon => (
                      <label
                        key={addon.id}
                        className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAddons[addon.code] || false}
                          onChange={() => toggleAddon(addon.code)}
                          className="mt-1 w-5 h-5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-black">{addon.nameEn}</h3>
                            <span className="font-bold text-black">
                              +€{addon.priceType === 'per_person' 
                                ? (addon.priceEur * formData.numberOfPeople).toFixed(2)
                                : addon.priceEur.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{addon.descriptionEn}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            €{addon.priceEur} {addon.priceType === 'per_person' ? 'per person' : 'per booking'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white border-2 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-4">Booking Summary</h2>
                
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tour</span>
                    <span className="font-semibold">{tour?.nameEn}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">People</span>
                    <span className="font-semibold">{formData.numberOfPeople}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Season</span>
                    <span className="font-semibold capitalize">{formData.season}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base price</span>
                    <span className="font-semibold">
                      €{getBasePrice()}
                    </span>
                  </div>
                  {addons.filter(a => selectedAddons[a.code]).map(addon => (
                    <div key={addon.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{addon.nameEn}</span>
                      <span className="font-semibold">
                        +€{addon.priceType === 'per_person' 
                          ? (addon.priceEur * formData.numberOfPeople).toFixed(2)
                          : addon.priceEur.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t-2 border-black mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold text-black">Total</span>
                    <span className="text-3xl font-bold text-black">€{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Proceed to Payment'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure payment powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
