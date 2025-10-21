'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculatePrice, getSeason } from '@yyd/shared';

interface BookingFlowProps {
  product: any;
}

type BookingStep = 'datetime' | 'customize' | 'details' | 'review';

export default function BookingFlow({ product }: BookingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<BookingStep>('datetime');
  
  // Step 1: Date & Time
  const [selectedDate, setSelectedDate] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  
  // Step 2: Customizations
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Step 3: Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocale, setCustomerLocale] = useState('en');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'messenger' | 'email'>('whatsapp');

  const calculateTotalPrice = () => {
    if (!selectedDate) return 0;

    const date = new Date(selectedDate);
    const tiers = product.seasonPrices.map((sp: any) => ({
      season: sp.season as 'low' | 'high',
      tier: sp.tier,
      minPeople: sp.minPeople,
      maxPeople: sp.maxPeople,
      priceEur: parseFloat(sp.priceEur.toString()),
      pricePerPerson: sp.pricePerPerson,
    }));

    const basePrice = calculatePrice(tiers, numberOfPeople, date) || 0;
    
    const optionsPrice = selectedOptions.reduce((sum, optionId) => {
      const option = product.options.find((o: any) => o.id === optionId);
      return sum + (option ? parseFloat(option.priceEur.toString()) : 0);
    }, 0);

    return basePrice + optionsPrice;
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleProceedToCheckout = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      const totalPrice = calculateTotalPrice();

      // Create booking in database
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          date: selectedDate,
          numberOfPeople,
          selectedActivities,
          selectedOptions,
          specialRequests,
          customerName,
          customerEmail,
          customerPhone,
          customerLocale,
          preferredContact,
          totalPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // API returned error
        throw new Error(data.error || 'Failed to create booking. Please try again.');
      }

      if (data.booking && data.booking.id) {
        // Redirect to Stripe checkout
        router.push(
          `/checkout?bookingId=${data.booking.id}&amount=${totalPrice}`
        );
      } else {
        throw new Error('Invalid booking response');
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
      setIsProcessing(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'datetime':
        return (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Select Date & Party Size</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="tour-date" className="block text-sm font-semibold mb-2">
                  Tour Date
                </label>
                <div className="relative cursor-pointer" onClick={() => {
                  const input = document.getElementById('tour-date') as HTMLInputElement;
                  if (input) {
                    if (input.showPicker) {
                      input.showPicker();
                    } else {
                      input.focus();
                    }
                  }
                }}>
                  <input
                    id="tour-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-turquoise focus:border-transparent cursor-pointer"
                  />
                </div>
                {selectedDate && (
                  <p className="text-sm text-gray-600 mt-2">
                    Season: {getSeason(new Date(selectedDate)) === 'high' ? '☀️ High Season' : '📅 Low Season'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Number of People
                </label>
                <select
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-turquoise focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Person' : 'People'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDate && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Estimated Price:</span>
                    <span className="text-2xl font-bold text-brand-turquoise">
                      €{calculateTotalPrice()}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setCurrentStep('customize')}
                disabled={!selectedDate}
                className="w-full bg-brand-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Continue to Customization
              </button>
            </div>
          </div>
        );

      case 'customize':
        return (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Customize Your Experience</h2>
            
            <div className="space-y-6">
              {product.activities.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Select Places to Visit</h3>
                  <div className="space-y-3">
                    {product.activities.map((activity: any) => (
                      <label key={activity.id} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedActivities.includes(activity.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedActivities([...selectedActivities, activity.id]);
                            } else {
                              setSelectedActivities(selectedActivities.filter(id => id !== activity.id));
                            }
                          }}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-semibold">{activity.nameEn}</div>
                          {activity.descriptionEn && (
                            <div className="text-sm text-gray-600">{activity.descriptionEn}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {product.options.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Additional Options</h3>
                  <div className="space-y-3">
                    {product.options.map((option: any) => (
                      <label key={option.id} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedOptions.includes(option.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOptions([...selectedOptions, option.id]);
                            } else {
                              setSelectedOptions(selectedOptions.filter(id => id !== option.id));
                            }
                          }}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-semibold">{option.nameEn}</div>
                          {option.descriptionEn && (
                            <div className="text-sm text-gray-600">{option.descriptionEn}</div>
                          )}
                        </div>
                        {option.priceEur > 0 && (
                          <div className="font-semibold text-brand-turquoise">
                            +€{parseFloat(option.priceEur.toString())}
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={4}
                  placeholder="Any dietary restrictions, mobility needs, or special requests..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-turquoise focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Price:</span>
                  <span className="text-2xl font-bold text-brand-turquoise">
                    €{calculateTotalPrice()}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('datetime')}
                  className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('details')}
                  className="flex-1 bg-brand-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  Continue to Details
                </button>
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Your Contact Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-turquoise focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-turquoise focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+351 xxx xxx xxx"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-turquoise focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Preferred Language
                </label>
                <select
                  value={customerLocale}
                  onChange={(e) => setCustomerLocale(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-turquoise focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Preferred Contact Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="contact"
                      value="whatsapp"
                      checked={preferredContact === 'whatsapp'}
                      onChange={(e) => setPreferredContact(e.target.value as any)}
                      className="mr-3"
                    />
                    <span className="font-semibold">📱 WhatsApp (Recommended)</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="contact"
                      value="messenger"
                      checked={preferredContact === 'messenger'}
                      onChange={(e) => setPreferredContact(e.target.value as any)}
                      className="mr-3"
                    />
                    <span className="font-semibold">💬 Facebook Messenger</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="contact"
                      value="email"
                      checked={preferredContact === 'email'}
                      onChange={(e) => setPreferredContact(e.target.value as any)}
                      className="mr-3"
                    />
                    <span className="font-semibold">📧 Email</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('customize')}
                  className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('review')}
                  disabled={!customerName || !customerEmail || !customerPhone}
                  className="flex-1 bg-brand-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Review Booking
                </button>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Review Your Booking</h2>
            
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Tour Details</h3>
                <p className="text-gray-600">{product.titleEn}</p>
                <p className="text-sm text-gray-500">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-500">{numberOfPeople} {numberOfPeople === 1 ? 'person' : 'people'}</p>
              </div>

              {selectedActivities.length > 0 && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Places to Visit</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {selectedActivities.map((id) => {
                      const activity = product.activities.find((a: any) => a.id === id);
                      return <li key={id}>{activity?.nameEn}</li>;
                    })}
                  </ul>
                </div>
              )}

              {selectedOptions.length > 0 && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Additional Options</h3>
                  <ul className="space-y-1">
                    {selectedOptions.map((id) => {
                      const option = product.options.find((o: any) => o.id === id);
                      return (
                        <li key={id} className="flex justify-between text-gray-600">
                          <span>{option?.nameEn}</span>
                          <span className="font-semibold">+€{parseFloat(option?.priceEur.toString() || '0')}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <p className="text-gray-600">{customerName}</p>
                <p className="text-gray-600">{customerEmail}</p>
                <p className="text-gray-600">{customerPhone}</p>
                <p className="text-sm text-gray-500">Preferred contact: {preferredContact}</p>
              </div>

              <div className="bg-brand-turquoise bg-opacity-10 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-3xl font-bold text-brand-turquoise">
                    €{calculateTotalPrice()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Secure payment via Stripe
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-semibold">⚠️ Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('details')}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isProcessing}
                  className="flex-1 bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  // Progress indicator
  const steps = [
    { id: 'datetime', label: 'Date & People' },
    { id: 'customize', label: 'Customize' },
    { id: 'details', label: 'Your Details' },
    { id: 'review', label: 'Review' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    index <= currentStepIndex
                      ? 'bg-brand-turquoise text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-sm mt-2 text-center">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    index < currentStepIndex ? 'bg-brand-turquoise' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      {renderStep()}
    </div>
  );
}
