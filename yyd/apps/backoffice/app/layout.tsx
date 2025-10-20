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
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-4 lg:p-8 lg:ml-[260px] bg-gray-50 pt-20 lg:pt-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
