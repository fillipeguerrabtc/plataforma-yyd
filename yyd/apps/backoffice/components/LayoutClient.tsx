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
    <div className="min-h-screen bg-gray-50">
      {showSidebar && <Sidebar />}
      <main
        className={`${showSidebar ? 'ml-0 md:ml-[260px]' : ''} ${
          isLoginPage ? '' : 'p-4 md:p-6 lg:p-8'
        } min-h-screen`}
      >
        {children}
      </main>
    </div>
  );
}
