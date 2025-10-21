'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (pathname === '/login') {
      setIsAuthenticated(false);
      return;
    }
    
    const userStr = localStorage.getItem('yyd-user');
    setIsAuthenticated(!!userStr);
  }, [pathname]);

  const isLoginPage = pathname === '/login';
  const showSidebar = mounted && isAuthenticated && !isLoginPage;

  return (
    <div className="min-h-screen bg-gray-50" style={{ display: 'flex' }}>
      {showSidebar && <Sidebar />}
      <main
        style={{
          marginLeft: showSidebar ? '260px' : '0',
          flex: 1,
          minHeight: '100vh',
          padding: isLoginPage ? '0' : '1.5rem',
        }}
      >
        {children}
      </main>
    </div>
  );
}
