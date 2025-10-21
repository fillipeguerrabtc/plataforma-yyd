'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navSections = [
  {
    title: 'Dashboard',
    items: [
      { href: '/', label: 'Início', icon: '🏠' },
      { href: '/analytics', label: 'Analytics', icon: '📊' },
    ],
  },
  {
    title: 'PRODUTOS',
    items: [
      { href: '/tours', label: 'Tours', icon: '🚗' },
      { href: '/products', label: 'Produtos', icon: '📦' },
    ],
  },
  {
    title: 'PESSOAS',
    items: [
      { href: '/guides', label: 'Guias', icon: '👨‍✈️' },
      { href: '/users', label: 'Usuários', icon: '👥' },
    ],
  },
  {
    title: 'FINANCEIRO (ERP)',
    items: [
      { href: '/financial/overview', label: 'Visão Geral', icon: '💰' },
      { href: '/financial/accounts', label: 'Contas', icon: '🏦' },
      { href: '/financial/ledger', label: 'Razão', icon: '📖' },
      { href: '/financial/payroll', label: 'Folha Pagamento', icon: '💵' },
      { href: '/financial/ar', label: 'Contas a Receber', icon: '📈' },
      { href: '/financial/ap', label: 'Contas a Pagar', icon: '📉' },
      { href: '/financial/reconciliation', label: 'Reconciliação', icon: '🔄' },
    ],
  },
  {
    title: 'CRM',
    items: [
      { href: '/crm/customers', label: 'Clientes', icon: '👤' },
      { href: '/crm/segments', label: 'Segmentos', icon: '🎯' },
      { href: '/crm/pipeline', label: 'Pipeline', icon: '🔀' },
      { href: '/crm/automations', label: 'Automações', icon: '⚙️' },
      { href: '/crm/communications', label: 'Comunicações', icon: '💬' },
    ],
  },
  {
    title: 'RESERVAS',
    items: [
      { href: '/bookings', label: 'Reservas', icon: '📅' },
      { href: '/calendar', label: 'Calendário', icon: '🗓️' },
    ],
  },
  {
    title: 'AURORA IA',
    items: [
      { href: '/aurora/config', label: 'Configuração', icon: '🤖' },
      { href: '/aurora/knowledge', label: 'Base Conhecimento', icon: '📚' },
      { href: '/aurora/conversations', label: 'Conversas', icon: '💬' },
      { href: '/aurora/analytics', label: 'Analytics', icon: '📊' },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { href: '/integrations', label: 'Integrações', icon: '🔌' },
      { href: '/reviews', label: 'Avaliações', icon: '⭐' },
      { href: '/settings', label: 'Configurações', icon: '⚙️' },
    ],
  },
];

export default function Navigation() {
  const pathname = usePathname();

  if (pathname === '/login') {
    return null;
  }

  return (
    <nav
      style={{
        width: '260px',
        height: '100vh',
        background: 'var(--brand-black)',
        color: 'white',
        overflowY: 'auto',
        position: 'fixed',
        left: 0,
        top: 0,
        padding: '1.5rem 0',
      }}
    >
      <div style={{ padding: '0 1rem 1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--brand-turquoise)' }}>
          YYD Backoffice
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
          ERP + CRM + IA
        </p>
      </div>

      {navSections.map((section) => (
        <div key={section.title} style={{ marginTop: '1.5rem' }}>
          <div
            style={{
              padding: '0 1rem',
              fontSize: '0.7rem',
              fontWeight: '700',
              color: 'var(--brand-turquoise)',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                  background: isActive ? 'rgba(31, 183, 196, 0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--brand-turquoise)' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
