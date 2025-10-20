'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/calendar', label: 'Calendar', icon: '📅' },
    { href: '/bookings', label: 'Reservas', icon: '🎫' },
    { href: '/customers', label: 'Clientes', icon: '👥' },
    { href: '/reviews', label: 'Reviews', icon: '⭐' },
    { href: '/guides', label: 'Guias', icon: '🚗' },
    { href: '/tours', label: 'Tours', icon: '🗺️' },
    { href: '/financial', label: 'Financeiro', icon: '💰' },
    { href: '/analytics', label: 'BI Analytics', icon: '📈' },
    { href: '/integrations', label: 'Integrações', icon: '🔗' },
    { href: '/aurora', label: 'Aurora IA', icon: '🤖' },
  ];

  return (
    <aside
      style={{
        width: '260px',
        height: '100vh',
        background: 'var(--brand-black)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <Image 
          src="/logo.png" 
          alt="Yes, You Deserve!" 
          width={70} 
          height={70}
          priority
          style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
        />
        <div style={{ textAlign: 'center' }}>
          <h1 className="font-pacifico" style={{ fontSize: '1.125rem', color: 'var(--brand-turquoise)' }}>
            Yes, You Deserve!
          </h1>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
            Backoffice
          </p>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.5rem',
                color: isActive ? 'var(--brand-turquoise)' : 'rgba(255,255,255,0.8)',
                background: isActive ? 'rgba(55, 200, 196, 0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--brand-turquoise)' : '3px solid transparent',
                fontSize: '0.9rem',
                fontWeight: isActive ? '600' : 'normal',
                transition: 'all 0.2s',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
          <p>Daniel Ponce</p>
          <p style={{ marginTop: '0.25rem' }}>daniel@yyd.tours</p>
        </div>
      </div>
    </aside>
  );
}
