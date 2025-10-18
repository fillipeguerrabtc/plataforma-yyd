'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import * as modalStyles from '../styles/modal.css';
import { StripeProviderWrapper } from './StripeProviderWrapper';

interface Tour {
  id: string;
  title_en: string;
  description_en: string;
  city: string;
  base_price_eur: string | number;
  duration_minutes: number;
}

interface BookingModalProps {
  tour: Tour;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BookingStep = 'details' | 'payment' | 'confirmation';

interface BookingData {
  tourDate: string;
  tourTime: string;
  participants: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry: string;
}

export function BookingModal({ tour, open, onOpenChange }: BookingModalProps) {
  const [step, setStep] = useState<BookingStep>('details');
  const [bookingData, setBookingData] = useState<BookingData>({
    tourDate: '',
    tourTime: '10:00',
    participants: 2,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCountry: 'Portugal',
  });
  const [bookingId, setBookingId] = useState<string>('');
  const [bookingNumber, setBookingNumber] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const basePrice = typeof tour.base_price_eur === 'string' 
    ? parseFloat(tour.base_price_eur) 
    : tour.base_price_eur;
  const totalPrice = basePrice * bookingData.participants;

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const baseUrl = backendUrl || (typeof window !== 'undefined' ? window.location.origin : '');
      
      const createBookingUrl = backendUrl 
        ? `${backendUrl}/api/v1/bookings/create`
        : '/api/backend/v1/bookings/create';

      const response = await fetch(createBookingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tour_id: tour.id,
          tour_date: `${bookingData.tourDate}T${bookingData.tourTime}:00`,
          participants: bookingData.participants,
          customer_name: bookingData.customerName,
          customer_email: bookingData.customerEmail,
          customer_phone: bookingData.customerPhone,
          customer_country: bookingData.customerCountry,
          language: 'en',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const booking = await response.json();
      setBookingId(booking.id);
      setBookingNumber(booking.booking_number);

      const paymentUrl = backendUrl 
        ? `${backendUrl}/api/v1/bookings/create-payment-intent`
        : '/api/backend/v1/bookings/create-payment-intent';

      const paymentResponse = await fetch(paymentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: booking.id,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const paymentData = await paymentResponse.json();
      setClientSecret(paymentData.clientSecret);
      setStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('details');
    setBookingData({
      tourDate: '',
      tourTime: '10:00',
      participants: 2,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerCountry: 'Portugal',
    });
    setBookingId('');
    setBookingNumber('');
    setClientSecret('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalStyles.overlay}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={modalStyles.content}
          >
            <Dialog.Title className={modalStyles.title}>
              {step === 'details' && 'Book Your Tour'}
              {step === 'payment' && 'Complete Payment'}
              {step === 'confirmation' && 'Booking Confirmed!'}
            </Dialog.Title>
            
            <Dialog.Description className={modalStyles.description}>
              {tour.title_en} - {tour.city}
            </Dialog.Description>

            <AnimatePresence mode="wait">
              {step === 'details' && (
                <BookingDetailsForm
                  key="details"
                  bookingData={bookingData}
                  setBookingData={setBookingData}
                  onSubmit={handleDetailsSubmit}
                  loading={loading}
                  error={error}
                  totalPrice={totalPrice}
                  onCancel={handleClose}
                />
              )}

              {step === 'payment' && clientSecret && (
                <StripeProviderWrapper key="payment" clientSecret={clientSecret}>
                  <PaymentForm
                    bookingNumber={bookingNumber}
                    totalPrice={totalPrice}
                    onSuccess={() => setStep('confirmation')}
                    onError={setError}
                    error={error}
                  />
                </StripeProviderWrapper>
              )}

              {step === 'confirmation' && (
                <ConfirmationView
                  key="confirmation"
                  bookingNumber={bookingNumber}
                  totalPrice={totalPrice}
                  onClose={handleClose}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function BookingDetailsForm({
  bookingData,
  setBookingData,
  onSubmit,
  loading,
  error,
  totalPrice,
  onCancel,
}: {
  bookingData: BookingData;
  setBookingData: (data: BookingData) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
  totalPrice: number;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onSubmit={onSubmit}
      className={modalStyles.form}
    >
      <div className={modalStyles.formGroup}>
        <label className={modalStyles.label}>Tour Date</label>
        <input
          type="date"
          min={today}
          required
          value={bookingData.tourDate}
          onChange={(e) => setBookingData({ ...bookingData, tourDate: e.target.value })}
          className={modalStyles.input}
        />
      </div>

      <div className={modalStyles.formGroup}>
        <label className={modalStyles.label}>Tour Time</label>
        <input
          type="time"
          required
          value={bookingData.tourTime}
          onChange={(e) => setBookingData({ ...bookingData, tourTime: e.target.value })}
          className={modalStyles.input}
        />
      </div>

      <div className={modalStyles.formGroup}>
        <label className={modalStyles.label}>Number of Participants</label>
        <input
          type="number"
          min="1"
          max="8"
          required
          value={bookingData.participants}
          onChange={(e) => setBookingData({ ...bookingData, participants: parseInt(e.target.value) })}
          className={modalStyles.input}
        />
      </div>

      <div className={modalStyles.formGroup}>
        <label className={modalStyles.label}>Full Name</label>
        <input
          type="text"
          required
          value={bookingData.customerName}
          onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
          className={modalStyles.input}
          placeholder="João Silva"
        />
      </div>

      <div className={modalStyles.formGroup}>
        <label className={modalStyles.label}>Email</label>
        <input
          type="email"
          required
          value={bookingData.customerEmail}
          onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
          className={modalStyles.input}
          placeholder="joao@example.com"
        />
      </div>

      <div className={modalStyles.formGroup}>
        <label className={modalStyles.label}>Phone</label>
        <input
          type="tel"
          value={bookingData.customerPhone}
          onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
          className={modalStyles.input}
          placeholder="+351 912 345 678"
        />
      </div>

      <div className={modalStyles.priceBox}>
        <span className={modalStyles.priceLabel}>Total Price:</span>
        <span className={modalStyles.priceValue}>€{totalPrice.toFixed(2)}</span>
      </div>

      {error && (
        <div className={modalStyles.error}>{error}</div>
      )}

      <div className={modalStyles.buttonGroup}>
        <button 
          type="button" 
          onClick={onCancel} 
          className={modalStyles.cancelButton}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className={modalStyles.confirmButton}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Continue to Payment'}
        </button>
      </div>
    </motion.form>
  );
}

function PaymentForm({
  bookingNumber,
  totalPrice,
  onSuccess,
  onError,
  error,
}: {
  bookingNumber: string;
  totalPrice: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  error: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    onError('');

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        onError(submitError.message || 'Payment failed');
      } else {
        onSuccess();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onSubmit={handleSubmit}
      className={modalStyles.form}
    >
      <div className={modalStyles.section}>
        <p className={modalStyles.sectionText}>
          Booking: <strong>{bookingNumber}</strong>
        </p>
      </div>

      <PaymentElement />

      <div className={modalStyles.priceBox}>
        <span className={modalStyles.priceLabel}>Amount to Pay:</span>
        <span className={modalStyles.priceValue}>€{totalPrice.toFixed(2)}</span>
      </div>

      {error && (
        <div className={modalStyles.error}>{error}</div>
      )}

      <button 
        type="submit" 
        className={modalStyles.confirmButton}
        disabled={!stripe || loading}
      >
        {loading ? 'Processing Payment...' : `Pay €${totalPrice.toFixed(2)}`}
      </button>
    </motion.form>
  );
}

function ConfirmationView({
  bookingNumber,
  totalPrice,
  onClose,
}: {
  bookingNumber: string;
  totalPrice: number;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={modalStyles.confirmationBox}
    >
      <div className={modalStyles.confirmationIcon}>✅</div>
      <h3 className={modalStyles.confirmationTitle}>Payment Successful!</h3>
      <p className={modalStyles.confirmationText}>
        Your booking has been confirmed.
      </p>
      <div className={modalStyles.confirmationDetails}>
        <p><strong>Booking Number:</strong> {bookingNumber}</p>
        <p><strong>Amount Paid:</strong> €{totalPrice.toFixed(2)}</p>
      </div>
      <p className={modalStyles.confirmationNote}>
        A confirmation email has been sent to your email address.
      </p>
      <button onClick={onClose} className={modalStyles.confirmButton}>
        Close
      </button>
    </motion.div>
  );
}
