'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { getBackOfficeToken } from '@/lib/backoffice-auth';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getBackOfficeToken();
    if (!token) {
      router.push('/backoffice/auth/login');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      <Sidebar />
      <div style={{ marginLeft: '260px', flex: 1, padding: '32px' }}>
        {children}
      </div>
    </div>
  );
}
