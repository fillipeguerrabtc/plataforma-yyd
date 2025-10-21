'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('bookingId');
  const paymentIntent = searchParams.get('payment_intent');

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    // Function to fetch booking details
    const fetchBooking = () => {
      fetch(`/api/bookings?id=${bookingId}`)
        .then((res) => res.json())
        .then((data) => {
          setBooking(data);
          setLoading(false);
          
          // Stop polling if confirmed or failed
          if (data.status === 'confirmed' || data.status === 'payment_failed' || data.status === 'cancelled') {
            if (intervalRef) {
              clearInterval(intervalRef);
            }
          }
        })
        .catch((err) => {
          console.error('Error fetching booking:', err);
          setLoading(false);
        });
    };

    // Initial fetch
    fetchBooking();

    // Auto-refresh every 3 seconds if pending (waiting for webhook)
    const intervalRef = setInterval(fetchBooking, 3000);

    // Cleanup on unmount
    return () => {
      if (intervalRef) {
        clearInterval(intervalRef);
      }
    };
  }, [bookingId]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-turquoise border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading your booking...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="max-w-md text-center p-8">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find your booking. Please contact us if you need assistance.
            </p>
            <Link
              href="/"
              className="inline-block bg-brand-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Return to Home
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isConfirmed = booking.status === 'confirmed';
  const isPending = booking.status === 'pending' || booking.status === 'pending_payment' || booking.status === 'processing';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {isConfirmed ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="text-4xl font-bold mb-4">Booking Confirmed! 🎉</h1>
              <p className="text-xl text-gray-600 mb-8">
                Thank you for booking with Yes, You Deserve!
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h2 className="text-2xl font-bold mb-4">Your Tour Details</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-gray-600">Booking Reference:</span>
                    <span className="font-semibold">{booking.bookingNumber}</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-gray-600">Tour:</span>
                    <span className="font-semibold">{booking.product?.titleEn}</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">
                      {new Date(booking.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-gray-600">Number of People:</span>
                    <span className="font-semibold">{booking.numberOfPeople}</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-semibold text-brand-turquoise text-xl">
                      €{parseFloat(booking.totalPriceEur?.toString() || '0')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold mb-3">📧 What's Next?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>A confirmation email has been sent to <strong>{booking.customer?.email}</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Our team will contact you via {booking.metadata?.preferredContact || 'email'} to confirm meeting details</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>You'll receive a reminder 24 hours before your tour</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="bg-brand-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  Return to Home
                </Link>
                <a
                  href="https://wa.me/14155238886"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Contact Us on WhatsApp
                </a>
              </div>
            </div>
          ) : isPending ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-blue-500 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>

              <h1 className="text-4xl font-bold mb-4">Payment Processing...</h1>
              <p className="text-xl text-gray-600 mb-4">
                Your payment was received successfully! ✅
              </p>
              <p className="text-gray-600 mb-8">
                We're confirming your booking now. This usually takes just a few seconds.
                You'll receive a confirmation email at <strong>{booking.customer?.email}</strong> shortly.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
                <h3 className="font-semibold mb-2">📋 Your Booking</h3>
                <p className="text-sm text-gray-700">Booking Reference: <strong>{booking.bookingNumber}</strong></p>
                <p className="text-sm text-gray-700">Tour: <strong>{booking.product?.titleEn}</strong></p>
                <p className="text-sm text-gray-700">Date: <strong>{new Date(booking.date).toLocaleDateString()}</strong></p>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-brand-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  Refresh Page
                </button>
                <Link
                  href="/"
                  className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <h1 className="text-4xl font-bold mb-4">Payment Failed</h1>
              <p className="text-xl text-gray-600 mb-8">
                Unfortunately, your payment could not be processed.
              </p>
              <p className="text-gray-600 mb-8">
                Please try again or contact us for assistance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/book/${booking.product?.slug}`}
                  className="bg-brand-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  Try Again
                </Link>
                <a
                  href="https://wa.me/14155238886"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Contact Support
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
