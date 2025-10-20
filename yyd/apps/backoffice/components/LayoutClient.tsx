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
    const userStr = localStorage.getItem('yyd-user');
    setIsAuthenticated(!!userStr);
    
    if (!userStr && pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  const isLoginPage = pathname === '/login';
  const showSidebar = mounted && isAuthenticated && !isLoginPage;

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
