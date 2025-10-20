import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://yesyoudeserve.com'),
  title: {
    default: 'YYD - Yes You Deserve | Premium Electric Tuk-Tuk Tours Sintra & Cascais',
    template: '%s | YYD Tours',
  },
  description: 'Experience unforgettable electric tuk-tuk tours in Sintra and Cascais, Portugal. Featured on ABC Good Morning America with 200+ 5-star TripAdvisor reviews. Book your premium eco-friendly tour today!',
  keywords: [
    'Sintra tours',
    'Cascais tours',
    'electric tuk-tuk',
    'Portugal tours',
    'Sintra tuk-tuk',
    'premium tours Portugal',
    'eco-friendly tours',
    'Sintra day trip',
    'Cascais sightseeing',
    'electric vehicle tours',
    'sustainable tourism Portugal',
    'luxury tuk-tuk experience',
  ],
  authors: [{ name: 'Daniel Ponce', url: 'https://yesyoudeserve.com' }],
  creator: 'YYD Tours',
  publisher: 'Yes You Deserve',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yesyoudeserve.com',
    siteName: 'Yes You Deserve',
    title: 'YYD - Premium Electric Tuk-Tuk Tours | Sintra & Cascais',
    description: 'Experience unforgettable electric tuk-tuk tours in Sintra and Cascais. Featured on ABC Good Morning America with 200+ 5-star reviews.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'YYD Premium Electric Tuk-Tuk Tours in Sintra and Cascais',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YYD - Premium Electric Tuk-Tuk Tours | Sintra & Cascais',
    description: 'Experience unforgettable electric tuk-tuk tours in Sintra and Cascais, Portugal.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://yesyoudeserve.com',
    languages: {
      'en-US': 'https://yesyoudeserve.com',
      'pt-BR': 'https://yesyoudeserve.com/pt',
      'es-ES': 'https://yesyoudeserve.com/es',
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&family=Montserrat:wght@400;700&family=Poppins:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#37C8C4" />
      </head>
      <body className="antialiased" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
