import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yes, You Deserve! | Private Tuk Tuk Tours in Sintra & Cascais',
  description: 'Premium private tuk tuk tours in Sintra and Cascais, Portugal. No crowds, no stress. Just you and the magic of Portugal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
