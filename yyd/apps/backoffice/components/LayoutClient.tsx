'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const userStr = localStorage.getItem('yyd-user');
    setIsAuthenticated(!!userStr);
    setIsLoading(false);
  }, [pathname]);

  const isLoginPage = pathname === '/login';
  const showSidebar = isAuthenticated && !isLoginPage;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1FB7C4] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <main
        className={`flex-1 ${showSidebar ? 'lg:ml-[260px]' : ''} ${
          isLoginPage ? '' : 'p-4 lg:p-8 bg-gray-50 pt-20 lg:pt-8'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
