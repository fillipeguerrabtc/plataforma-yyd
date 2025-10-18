import type { Metadata } from 'next';
import { Playball, Poppins, Open_Sans } from 'next/font/google';
import './styles/global.css';

const playball = Playball({
  subsets: ['latin'],
  variable: '--font-playball',
  weight: ['400'],
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '600', '700', '800'],
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-opensans',
  weight: ['300', '400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'YYD - Yes You Deserve | Boutique Tourism Portugal',
  description: 'Experience the magic of Sintra, Cascais, Lisboa, and Douro with our private electric tuk-tuk tours.',
  keywords: ['tours', 'Portugal', 'Sintra', 'Cascais', 'Lisboa', 'Douro', 'tuk-tuk', 'electric tours'],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

import AuroraChatWidget from './components/AuroraChatWidget';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playball.variable} ${poppins.variable} ${openSans.variable}`}>
      <body>
        {children}
        <AuroraChatWidget />
      </body>
    </html>
  );
}
