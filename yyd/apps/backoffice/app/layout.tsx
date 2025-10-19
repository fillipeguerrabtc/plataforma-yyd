import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'YYD Backoffice - Tour Management',
  description: 'Manage tours, bookings, guides, and customers for Yes, You Deserve!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ flex: 1, marginLeft: '260px', padding: '2rem', background: 'var(--gray-50)' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
