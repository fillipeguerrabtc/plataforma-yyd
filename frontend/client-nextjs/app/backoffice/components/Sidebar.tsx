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
    { href: '/backoffice/customers', label: 'Customers', icon: '👤' },
    { href: '/backoffice/users', label: 'Users', icon: '👥' },
    { href: '/backoffice/aurora', label: 'Aurora IA', icon: '🤖' },
  ];

  return (
    <div style={{
      width: '260px',
      background: 'linear-gradient(135deg, #00B5CC 0%, #33C5DD 100%)',
      color: 'white',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      boxShadow: '4px 0 12px rgba(0,181,204,0.15)'
    }}>
      <div style={{ padding: '0 24px', marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#FFFFFF',
          marginBottom: '4px',
          fontFamily: "'Playball', cursive",
          textShadow: '0 2px 4px rgba(0,0,0,0.15)'
        }}>
          Yes You Deserve
        </h2>
        <p style={{ 
          fontSize: '13px', 
          color: 'rgba(255,255,255,0.85)',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: '500'
        }}>
          BackOffice
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
                padding: '14px 24px',
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.8)',
                background: isActive ? 'rgba(255,255,255,0.25)' : 'transparent',
                borderLeft: isActive ? '4px solid #FFFFFF' : '4px solid transparent',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: isActive ? '600' : '400',
                fontFamily: "'Poppins', sans-serif",
                transition: 'all 0.3s ease-in-out',
                borderRadius: isActive ? '0 12px 12px 0' : '0'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.paddingLeft = '28px';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.paddingLeft = '24px';
                }
              }}
            >
              <span style={{ marginRight: '12px', fontSize: '18px' }}>{item.icon}</span>
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
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: "'Poppins', sans-serif",
          transition: 'all 0.3s ease-in-out',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
        }}
      >
        🚪 Sign Out
      </button>
    </div>
  );
}
