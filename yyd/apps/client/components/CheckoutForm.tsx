'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  bookingId: string;
}

export default function CheckoutForm({ bookingId }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Step 1: Validate form before submission (Stripe best practice)
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || 'Please check your payment details');
        setIsLoading(false);
        return;
      }

      // Step 2: Confirm payment with redirect: 'if_required' for cards
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation?bookingId=${bookingId}`,
        },
        redirect: 'if_required', // Only redirect for payment methods that require it
      });

      if (error) {
        // Only shows for immediate errors (card declined, etc)
        setErrorMessage(error.message || 'An error occurred during payment');
        setIsLoading(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded without redirect (most cards)
        router.push(`/booking-confirmation?bookingId=${bookingId}&payment_intent=${paymentIntent.id}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage('Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      
      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full mt-6 bg-brand-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Processing...
          </span>
        ) : (
          'Pay Now'
        )}
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        By completing this payment you agree to our{' '}
        <a href="/terms" className="text-brand-turquoise hover:underline">
          Terms & Conditions
        </a>
      </p>
    </form>
  );
}
