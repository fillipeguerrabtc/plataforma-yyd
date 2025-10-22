import type { Metadata } from 'next';
import './globals.css';
import LayoutClient from '@/components/LayoutClient';

export const metadata: Metadata = {
  title: 'YYD Backoffice - Tour Management',
  description: 'Manage tours, bookings, guides, and customers for Yes, You Deserve!',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
