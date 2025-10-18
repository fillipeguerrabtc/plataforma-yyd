'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { removeBackOfficeToken } from '@/lib/backoffice-auth';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeBackOfficeToken();
    router.push('/backoffice/auth/login');
  };

  const menuItems = [
    { href: '/backoffice/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/backoffice/config', label: 'Site Configuration', icon: '⚙️' },
    { href: '/backoffice/tours', label: 'Tours', icon: '🚙' },
    { href: '/backoffice/bookings', label: 'Bookings', icon: '📅' },
    { href: '/backoffice/leads', label: 'Leads', icon: '📝' },
    { href: '/backoffice/users', label: 'Users', icon: '👥' },
  ];

  return (
    <div style={{
      width: '260px',
      background: '#1A1A1A',
      color: 'white',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0'
    }}>
      <div style={{ padding: '0 24px', marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#5FBCBC',
          marginBottom: '4px'
        }}>
          YYD BackOffice
        </h2>
        <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
          Management Panel
        </p>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '12px 24px',
                color: isActive ? '#5FBCBC' : '#D1D5DB',
                background: isActive ? 'rgba(95, 188, 188, 0.1)' : 'transparent',
                borderLeft: isActive ? '4px solid #5FBCBC' : '4px solid transparent',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: isActive ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ marginRight: '12px' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        style={{
          margin: '0 24px',
          padding: '12px',
          background: '#374151',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        🚪 Sign Out
      </button>
    </div>
  );
}
