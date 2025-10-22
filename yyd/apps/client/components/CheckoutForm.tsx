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

      console.log('🔍 Payment confirmation result:', { error, paymentIntent });

      if (error) {
        // Only shows for immediate errors (card declined, etc)
        console.error('❌ Payment error:', error);
        setErrorMessage(error.message || 'An error occurred during payment');
        setIsLoading(false);
      } else if (paymentIntent) {
        // Log the payment intent status for debugging
        console.log('✅ Payment Intent:', paymentIntent.id, 'Status:', paymentIntent.status);
        
        if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing') {
          // Payment succeeded or is processing (webhook will confirm)
          router.push(`/booking-confirmation?bookingId=${bookingId}&payment_intent=${paymentIntent.id}&redirect_status=succeeded`);
        } else {
          setErrorMessage(`Payment status: ${paymentIntent.status}. Please contact support.`);
          setIsLoading(false);
        }
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
        className="w-full mt-6 bg-gray-900 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center font-bold">
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Processing...
          </span>
        ) : (
          <span className="font-bold tracking-wide">Pay Now</span>
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
