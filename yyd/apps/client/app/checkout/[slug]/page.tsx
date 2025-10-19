"use client";

import { useState } from 'react';

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState(1);
  const [quote, setQuote] = useState<{ price_eur: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: 'guest',
          tour_id: params.slug,
          date,
          seats
        })
      });
      const data = await res.json();
      setQuote(data);
    } catch (error) {
      console.error('Quote error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!quote) return;
    
    alert('Payment integration - would create Stripe PaymentLink here');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🎫 Checkout: {params.slug}</h1>

      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Seats</label>
          <input
            type="number"
            min="1"
            value={seats}
            onChange={(e) => setSeats(parseInt(e.target.value))}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          />
        </div>

        <button
          onClick={handleGetQuote}
          disabled={!date || loading}
          style={{
            width: '100%',
            padding: '1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: date ? 'pointer' : 'not-allowed',
            opacity: date ? 1 : 0.5
          }}
        >
          {loading ? 'Calculating...' : 'Get Quote'}
        </button>

        {quote && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0f9ff', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Price</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              €{quote.price_eur.toFixed(2)}
            </div>
            <button
              onClick={handlePay}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '1rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Pay with Stripe →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
