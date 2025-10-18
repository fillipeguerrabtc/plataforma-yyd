'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ''
);

interface StripeProviderWrapperProps {
  children: ReactNode;
  clientSecret?: string;
}

export function StripeProviderWrapper({ 
  children, 
  clientSecret 
}: StripeProviderWrapperProps) {
  if (!clientSecret) {
    return <>{children}</>;
  }

  return (
    <Elements 
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#37C8C4',
            colorBackground: '#ffffff',
            colorText: '#1A1A1A',
            colorDanger: '#df1b41',
            fontFamily: 'Lato, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
