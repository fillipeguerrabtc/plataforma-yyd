'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface UserPermission {
  permissionId: string;
  canRead: boolean;
  canWrite: boolean;
  permission: {
    resource: string;
    action: string;
  };
}

// Map routes to required permissions (resource.action format)
const routePermissionMap: Record<string, string> = {
  '/': 'dashboard.view',
  '/analytics': 'bi_analytics.view',
  '/tours': 'products.view',
  '/guides': 'guides.view',
  '/staff': 'staff.view',
  '/vendors': 'vendors.view',
  '/departments': 'departments.view',
  '/fleet': 'fleet.read',
  '/financial': 'finance.view_dashboard',
  '/finance/payments': 'payments.view',
  '/finance/stripe-connect': 'finance.manage_stripe_connect',
  '/financial/accounts': 'accounts.view',
  '/financial/ledger': 'ledger.view',
  '/financial/payroll': 'payroll.view',
  '/financial/ar': 'ar.view',
  '/financial/ap': 'ap.view',
  '/customers': 'customers.read',
  '/crm/segments': 'crm_segments.view',
  '/crm/automations': 'crm_automations.view',
  '/bookings': 'bookings.view',
  '/my-tours': 'no-permission-required',
  '/calendar': 'calendar.view',
  '/aurora': 'aurora.view',
  '/aurora/knowledge': 'aurora.manage_knowledge',
  '/aurora/config': 'aurora.configure',
  '/chat': 'no-permission-required',
  '/integrations': 'integrations.view',
  '/reviews': 'reviews.view',
  '/settings/emails': 'emails.view',
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<Map<string, { canRead: boolean; canWrite: boolean }>>(new Map());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function fetchCurrentUserAndPermissions() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);

          // Fetch user's effective permissions
          const permsRes = await fetch('/api/auth/permissions');
          if (permsRes.ok) {
            const permsData = await permsRes.json();
            
            // Check if user is administrator (permissions is an object, not array)
            const adminFullAccess = permsData.permissions?.['administrator.full_access'];
            setIsAdmin(!!adminFullAccess?.canRead);

            // Build permission map from object: "resource.action" -> { canRead, canWrite }
            const permMap = new Map<string, { canRead: boolean; canWrite: boolean }>();
            Object.entries(permsData.permissions || {}).forEach(([key, perm]: [string, any]) => {
              permMap.set(key, {
                canRead: perm.canRead || false,
                canWrite: perm.canWrite || false,
              });
            });
            setUserPermissions(permMap);
            
            console.log('✅ Admin status:', !!adminFullAccess?.canRead);
            console.log('✅ Total permissions:', permMap.size);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuário e permissões:', error);
      }
    }
    fetchCurrentUserAndPermissions();
  }, []);

  const hasPermission = (route: string): boolean => {
    // Administrators see everything
    if (isAdmin) return true;

    const requiredPerm = routePermissionMap[route];
    if (!requiredPerm || requiredPerm === 'no-permission-required') return true; // If no permission required, allow access

    // Guides always have access to My Tours and Chat
    if (currentUser?.userType === 'guide' && (route === '/my-tours' || route === '/chat' || route === '/calendar')) {
      return true;
    }

    const perm = userPermissions.get(requiredPerm);
    return perm?.canRead || false;
  };

  const navSections = [
    {
      title: 'GERAL',
      items: [
        { href: '/', label: 'Dashboard', icon: '📊' },
        { href: '/analytics', label: 'BI Analytics', icon: '📈' },
      ],
    },
    {
      title: 'PRODUTOS',
      items: [
        { href: '/tours', label: 'Tours', icon: '🗺️' },
      ],
    },
    {
      title: 'PESSOAS',
      items: [
        { href: '/guides', label: 'Guias', icon: '🚗' },
        { href: '/staff', label: 'Funcionários', icon: '👤' },
        { href: '/vendors', label: 'Fornecedores', icon: '🏢' },
        { href: '/departments', label: 'Departamentos', icon: '🏛️' },
      ],
    },
    {
      title: 'OPERAÇÕES',
      items: [
        { href: '/fleet', label: 'Frota', icon: '🚙' },
      ],
    },
    {
      title: 'FINANCEIRO',
      items: [
        { href: '/financial', label: 'Visão Geral', icon: '💰' },
        { href: '/finance/payments', label: 'Pagamentos', icon: '💳' },
        { href: '/finance/stripe-connect', label: 'Stripe Connect', icon: '💸' },
        { href: '/financial/accounts', label: 'Contas', icon: '🏦' },
        { href: '/financial/ledger', label: 'Razão', icon: '📖' },
        { href: '/financial/payroll', label: 'Folha Pagamento', icon: '💵' },
        { href: '/financial/ar', label: 'Contas a Receber', icon: '📈' },
        { href: '/financial/ap', label: 'Contas a Pagar', icon: '📉' },
      ],
    },
    {
      title: 'CRM',
      items: [
        { href: '/customers', label: 'Clientes', icon: '👥' },
        { href: '/crm/segments', label: 'Segmentos', icon: '🎯' },
        { href: '/crm/automations', label: 'Automações', icon: '⚙️' },
      ],
    },
    {
      title: 'RESERVAS',
      items: [
        { href: '/bookings', label: 'Reservas', icon: '🎫' },
        { href: '/my-tours', label: 'Meus Tours', icon: '🚗' },
        { href: '/calendar', label: 'Calendário', icon: '📅' },
      ],
    },
    {
      title: 'AURORA IA',
      items: [
        { href: '/aurora', label: 'Chat Aurora', icon: '🤖' },
        { href: '/aurora/knowledge', label: 'Knowledge Base', icon: '🧠' },
        { href: '/aurora/config', label: 'Configuração', icon: '⚙️' },
      ],
    },
    {
      title: 'COMUNICAÇÃO',
      items: [
        { href: '/chat', label: 'Chat Interno', icon: '💬' },
      ],
    },
    {
      title: 'SISTEMA',
      items: [
        { href: '/integrations', label: 'Integrações', icon: '🔗' },
        { href: '/reviews', label: 'Reviews', icon: '⭐' },
        { href: '/settings/emails', label: 'Config. Emails', icon: '📧' },
      ],
    },
  ];

  // Filter sections and items based on permissions
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasPermission(item.href)),
    }))
    .filter((section) => section.items.length > 0); // Hide empty sections

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-black text-white p-3 rounded-lg shadow-lg"
        aria-label="Menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-40 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          width: '260px',
          background: '#1a1a1a',
          color: '#ffffff',
        }}
      >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'opacity 0.2s' }} 
             onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
             onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
          <Image 
            src="/logo.png" 
            alt="Yes, You Deserve!" 
            width={70} 
            height={70}
            priority
            style={{ objectFit: 'contain' }}
          />
          <div style={{ textAlign: 'center' }}>
            <h1 className="font-pacifico" style={{ fontSize: '1.125rem', color: 'var(--brand-turquoise)' }}>
              Yes, You Deserve!
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
              Backoffice {isAdmin && '• Admin'}
            </p>
          </div>
        </div>
      </Link>

      <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
        {filteredSections.map((section) => (
          <div key={section.title} style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                padding: '0.5rem 1.5rem',
                fontSize: '0.65rem',
                fontWeight: '700',
                color: '#23C0E3',
                letterSpacing: '0.05em',
                marginBottom: '0.25rem',
              }}
            >
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1.5rem',
                    color: isActive ? '#23C0E3' : '#ffffff',
                    background: isActive ? 'rgba(35, 192, 227, 0.15)' : 'transparent',
                    borderLeft: isActive ? '3px solid #23C0E3' : '3px solid transparent',
                    textShadow: isActive ? 'none' : '0px 2px 4px rgba(0,0,0,0.9)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' }}>
          <p>{currentUser?.name || 'Carregando...'}</p>
          <p style={{ marginTop: '0.25rem' }}>{currentUser?.email || ''}</p>
        </div>
        <button
          onClick={() => {
            document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = '/login';
          }}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#7e3231',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <span>🚪</span>
          <span>Sair</span>
        </button>
      </div>
      </aside>
    </>
  );
}
