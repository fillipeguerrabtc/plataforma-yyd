'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('bookingId');
  const paymentIntent = searchParams.get('payment_intent');

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setBooking(data);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-turquoise border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for booking with Yes You Deserve!
          </p>
        </div>

        {/* Booking Details */}
        {booking && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Booking Details
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Booking Number:</span>
                <span className="font-semibold text-gray-900">{booking.bookingNumber}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Tour:</span>
                <span className="font-semibold text-gray-900">{booking.product?.titleEn}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(booking.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold text-gray-900">{booking.startTime}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">People:</span>
                <span className="font-semibold text-gray-900">{booking.numberOfPeople}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Total Paid:</span>
                <span className="text-2xl font-bold text-gray-900">€{Number(booking.priceEur).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-turquoise-50 border border-turquoise-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">What's Next?</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-turquoise-600 mt-1">✓</span>
              <span>Check your email for the booking confirmation and voucher</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-turquoise-600 mt-1">✓</span>
              <span>You'll receive a reminder 24 hours before your tour</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-turquoise-600 mt-1">✓</span>
              <span>Present your voucher (digital or printed) on the day of the tour</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 bg-black text-white py-3 rounded-lg font-semibold text-center hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/tours"
            className="flex-1 border-2 border-black text-black py-3 rounded-lg font-semibold text-center hover:bg-gray-50 transition-colors"
          >
            Browse More Tours
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Questions about your booking?</p>
          <a href="mailto:hello@yesyoudeserve.tours" className="text-turquoise-600 hover:underline font-medium">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
