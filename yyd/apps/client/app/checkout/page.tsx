'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CheckoutForm from '@/components/CheckoutForm';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<any>(null);

  const bookingId = searchParams.get('bookingId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!bookingId || !amount) {
      setError('Missing booking details. Please start from booking flow.');
      setLoading(false);
      return;
    }

    // Fetch booking details
    fetch(`/api/bookings?id=${bookingId}`)
      .then((res) => res.json())
      .then((bookingData) => {
        setBooking(bookingData);

        // CRITICAL: Use server-side stored price, ignore query param
        const verifiedAmount = parseFloat(bookingData.totalPriceEur?.toString() || '0');

        // Create payment intent
        return fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: verifiedAmount,
            currency: 'eur',
            metadata: {
              bookingId,
              productId: bookingData.productId,
              customerId: bookingData.customerId,
            },
          }),
        });
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
        } else {
          setClientSecret(data.clientSecret);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Checkout error:', err);
        setError('Failed to initialize payment. Please try again.');
        setLoading(false);
      });
  }, [bookingId, amount]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-turquoise border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Preparing your checkout...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="max-w-md text-center p-8">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-4">Checkout Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/"
              className="inline-block bg-brand-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Return to Home
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#37C8C4',
      colorBackground: '#ffffff',
      colorText: '#1A1A1A',
      colorDanger: '#df1b41',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
            <p className="text-gray-600 mb-4">
              Secure payment powered by Stripe
            </p>

            {booking && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">{booking.product?.titleEn}</p>
                <p className="text-sm text-gray-600">
                  {new Date(booking.date).toLocaleDateString()} · {booking.numberOfPeople} people
                </p>
                <p className="text-lg font-bold text-brand-turquoise mt-2">
                  €{parseFloat(booking.totalPriceEur?.toString() || '0')}
                </p>
              </div>
            )}

            {clientSecret && (
              <Elements
                stripe={getStripe()}
                options={{
                  clientSecret,
                  appearance,
                }}
              >
                <CheckoutForm bookingId={bookingId || ''} />
              </Elements>
            )}
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-4">Secure Payment</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>SSL encrypted payment processing</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Your card details are never stored on our servers</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Instant booking confirmation</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
