'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Tab = 'overview' | 'payables' | 'receivables' | 'reconciliation';

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [payables, setPayables] = useState<any[]>([]);
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await fetch('/api/financial/reconciliation');
        const data = await res.json();
        setOverview(data);
      } else if (activeTab === 'reconciliation') {
        const res = await fetch('/api/financial/reconciliation');
        const data = await res.json();
        setReconciliation(data);
      } else if (activeTab === 'payables') {
        const res = await fetch('/api/financial/ap');
        const data = await res.json();
        setPayables(data);
      } else if (activeTab === 'receivables') {
        const res = await fetch('/api/financial/ar');
        const data = await res.json();
        setReceivables(data);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markPaid(type: 'ap' | 'ar', id: string) {
    try {
      await fetch(`/api/financial/${type}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid', paidAt: new Date().toISOString() }),
      });
      loadData();
    } catch (error) {
      console.error('Mark paid error:', error);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          💰 Gestão Financeira
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          Overview, reconciliação, contas a pagar e a receber
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--gray-200)' }}>
        <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
        <TabButton label="Reconciliação" active={activeTab === 'reconciliation'} onClick={() => setActiveTab('reconciliation')} />
        <TabButton label="Contas a Pagar" active={activeTab === 'payables'} onClick={() => setActiveTab('payables')} />
        <TabButton label="Contas a Receber" active={activeTab === 'receivables'} onClick={() => setActiveTab('receivables')} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>Carregando...</div>
      ) : (
        <>
          {activeTab === 'overview' && overview && <OverviewView data={overview} />}
          {activeTab === 'reconciliation' && reconciliation && <ReconciliationView data={reconciliation} />}
          {activeTab === 'payables' && <PayablesView payables={payables} onMarkPaid={(id) => markPaid('ap', id)} />}
          {activeTab === 'receivables' && <ReceivablesView receivables={receivables} onMarkPaid={(id) => markPaid('ar', id)} />}
        </>
      )}
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.75rem 1.5rem',
        background: 'transparent',
        color: active ? 'var(--brand-turquoise)' : 'var(--gray-600)',
        border: 'none',
        borderBottom: active ? '3px solid var(--brand-turquoise)' : '3px solid transparent',
        fontWeight: active ? '600' : 'normal',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}

function OverviewView({ data }: { data: any }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
      <ClickableStatCard
        title="Receita Total"
        value={`R$${Number(data.summary.totalRevenue).toFixed(2)}`}
        color="var(--brand-turquoise)"
        icon="💰"
        href="/financial/transactions?type=income"
      />
      <ClickableStatCard
        title="Despesas Totais"
        value={`R$${Number(data.summary.totalExpenses).toFixed(2)}`}
        color="var(--brand-bordeaux)"
        icon="💸"
        href="/financial/transactions?type=expense"
      />
      <StatCard
        title="Posição Líquida"
        value={`R$${Number(data.summary.netPosition).toFixed(2)}`}
        color={data.summary.netPosition >= 0 ? 'var(--brand-turquoise)' : 'var(--brand-bordeaux)'}
        icon="📊"
      />
      <StatCard
        title="Saldo Pendente"
        value={`R$${Number(data.summary.pendingBalance).toFixed(2)}`}
        color="var(--brand-gold)"
        icon="⏳"
      />
    </div>
  );
}

function ReconciliationView({ data }: { data: any }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Receita Total" value={`R$${Number(data.summary.totalRevenue).toFixed(2)}`} color="var(--brand-turquoise)" icon="💰" />
        <StatCard title="Despesas Totais" value={`R$${Number(data.summary.totalExpenses).toFixed(2)}`} color="var(--brand-bordeaux)" icon="💸" />
        <StatCard title="Posição Líquida" value={`R$${Number(data.summary.netPosition).toFixed(2)}`} color={data.summary.netPosition >= 0 ? 'var(--brand-turquoise)' : 'var(--brand-bordeaux)'} icon="📊" />
        <StatCard title="Saldo Pendente" value={`R$${Number(data.summary.pendingBalance).toFixed(2)}`} color="var(--brand-gold)" icon="⏳" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>💵 A Receber</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <InfoRow label="Pendente" value={`R$${Number(data.receivables.pending.total).toFixed(2)} (${data.receivables.pending.count})`} />
            <InfoRow label="Recebido" value={`R$${Number(data.receivables.paid.total).toFixed(2)} (${data.receivables.paid.count})`} />
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>💳 A Pagar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <InfoRow label="Pendente" value={`R$${Number(data.payables.pending.total).toFixed(2)} (${data.payables.pending.count})`} />
            <InfoRow label="Pago" value={`R$${Number(data.payables.paid.total).toFixed(2)} (${data.payables.paid.count})`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PayablesView({ payables, onMarkPaid }: { payables: any[]; onMarkPaid: (id: string) => void }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--gray-100)' }}>
            <th style={thStyle}>Fornecedor</th>
            <th style={thStyle}>Descrição</th>
            <th style={thStyle}>Valor</th>
            <th style={thStyle}>Vencimento</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {payables.length === 0 ? (
            <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--gray-500)' }}>Nenhuma conta a pagar</td></tr>
          ) : (
            payables.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <td style={tdStyle}>{item.vendor}</td>
                <td style={tdStyle}>{item.description || '-'}</td>
                <td style={tdStyle}>
                  <span style={{ fontWeight: '600', color: 'var(--brand-bordeaux)' }}>R${Number(item.amount).toFixed(2)}</span>
                </td>
                <td style={tdStyle}>{new Date(item.dueDate).toLocaleDateString('pt-BR')}</td>
                <td style={tdStyle}><StatusBadge status={item.status} /></td>
                <td style={tdStyle}>
                  {item.status === 'open' && (
                    <button onClick={() => onMarkPaid(item.id)} style={{ padding: '0.25rem 0.75rem', background: 'var(--brand-turquoise)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>
                      Marcar como Pago
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ReceivablesView({ receivables, onMarkPaid }: { receivables: any[]; onMarkPaid: (id: string) => void }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--gray-100)' }}>
            <th style={thStyle}>Cliente</th>
            <th style={thStyle}>Descrição</th>
            <th style={thStyle}>Valor</th>
            <th style={thStyle}>Vencimento</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {receivables.length === 0 ? (
            <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--gray-500)' }}>Nenhuma conta a receber</td></tr>
          ) : (
            receivables.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <td style={tdStyle}>
                  <div>{item.customer?.name || '-'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{item.customer?.email || ''}</div>
                </td>
                <td style={tdStyle}>{item.description || '-'}</td>
                <td style={tdStyle}>
                  <span style={{ fontWeight: '600', color: 'var(--brand-turquoise)' }}>R${Number(item.amount).toFixed(2)}</span>
                </td>
                <td style={tdStyle}>{new Date(item.dueDate).toLocaleDateString('pt-BR')}</td>
                <td style={tdStyle}><StatusBadge status={item.status} /></td>
                <td style={tdStyle}>
                  {item.status === 'open' && (
                    <button onClick={() => onMarkPaid(item.id)} style={{ padding: '0.25rem 0.75rem', background: 'var(--brand-turquoise)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>
                      Marcar como Recebido
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ title, value, color, icon }: { title: string; value: string; color: string; icon: string }) {
  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>{title}</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</p>
        </div>
        <div style={{ width: '48px', height: '48px', background: `${color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ClickableStatCard({ title, value, color, icon, href }: { title: string; value: string; color: string; icon: string; href: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          border: '2px solid transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>{title}</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>{value}</p>
            <p style={{ fontSize: '0.75rem', color, marginTop: '0.5rem', fontWeight: '600' }}>Ver histórico →</p>
          </div>
          <div style={{ width: '48px', height: '48px', background: `${color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--gray-200)' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{label}:</span>
      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-800)' }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: { [key: string]: { bg: string; text: string } } = {
    open: { bg: 'var(--brand-gold)15', text: 'var(--brand-gold)' },
    paid: { bg: 'var(--brand-turquoise)15', text: 'var(--brand-turquoise)' },
  };
  const colorScheme = colors[status] || colors.open;
  return (
    <span style={{ padding: '0.25rem 0.75rem', background: colorScheme.bg, color: colorScheme.text, borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
      {status}
    </span>
  );
}

const thStyle = { padding: '0.75rem 1rem', textAlign: 'left' as const, fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)' };
const tdStyle = { padding: '1rem', fontSize: '0.875rem', color: 'var(--gray-800)' };
