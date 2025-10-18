import type { Metadata } from 'next';
import { Montserrat, Lato } from 'next/font/google';
import './styles/global.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '600', '700', '800'],
});

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-lato',
  weight: ['300', '400', '700'],
});

export const metadata: Metadata = {
  title: 'YYD - Yes You Deserve | Boutique Tourism Portugal',
  description: 'Experience the magic of Sintra, Cascais, Lisboa, and Douro with our private electric tuk-tuk tours.',
  keywords: ['tours', 'Portugal', 'Sintra', 'Cascais', 'Lisboa', 'Douro', 'tuk-tuk', 'electric tours'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${lato.variable}`}>
      <body>{children}</body>
    </html>
  );
}
