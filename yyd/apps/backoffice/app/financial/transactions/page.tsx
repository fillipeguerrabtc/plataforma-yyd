'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type TransactionType = 'income' | 'expense' | 'all';

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<TransactionType>('all');

  useEffect(() => {
    // Get filter from URL if present - sync on every URL change
    const typeParam = searchParams.get('type') as TransactionType;
    if (typeParam && typeParam !== filterType) {
      setFilterType(typeParam);
    }
  }, [searchParams.toString()]); // CRITICAL: Watch searchParams changes for URL navigation

  useEffect(() => {
    loadTransactions();
  }, [filterType]);

  async function loadTransactions() {
    setLoading(true);
    try {
      const url = `/api/financial/transactions?type=${filterType}`;
      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setSummary(data.summary || {});
    } catch (error) {
      console.error('Load transactions error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
            📊 Histórico de Transações
          </h1>
          <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            Todas as entradas e saídas financeiras
          </p>
        </div>
        <Link
          href="/financial"
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--gray-200)',
            color: 'var(--gray-800)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          ← Voltar
        </Link>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <StatCard
            title="Total de Receitas"
            value={`R$${summary.totalIncome.toFixed(2)}`}
            color="var(--brand-turquoise)"
            icon="💰"
          />
          <StatCard
            title="Total de Despesas"
            value={`R$${summary.totalExpenses.toFixed(2)}`}
            color="var(--brand-bordeaux)"
            icon="💸"
          />
          <StatCard
            title="Posição Líquida"
            value={`R$${summary.netPosition.toFixed(2)}`}
            color={summary.netPosition >= 0 ? 'var(--brand-turquoise)' : 'var(--brand-bordeaux)'}
            icon="📊"
          />
          <StatCard
            title="Total de Transações"
            value={summary.count}
            color="var(--brand-gold)"
            icon="📋"
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--gray-200)' }}>
        <TabButton
          label="Todas"
          active={filterType === 'all'}
          onClick={() => setFilterType('all')}
          icon="📊"
        />
        <TabButton
          label="Receitas"
          active={filterType === 'income'}
          onClick={() => setFilterType('income')}
          icon="💰"
        />
        <TabButton
          label="Despesas"
          active={filterType === 'expense'}
          onClick={() => setFilterType('expense')}
          icon="💸"
        />
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
          Carregando transações...
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
          Nenhuma transação encontrada.
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-100)' }}>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Categoria</th>
                <th style={thStyle}>Descrição</th>
                <th style={thStyle}>Origem/Destino</th>
                <th style={thStyle}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={tdStyle}>
                    {new Date(transaction.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td style={tdStyle}>
                    <TransactionTypeBadge type={transaction.type} />
                  </td>
                  <td style={tdStyle}>
                    <CategoryBadge category={transaction.category} label={transaction.categoryLabel} />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: '500' }}>{transaction.description}</div>
                    {transaction.metadata?.tourName && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                        {transaction.metadata.tourName}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: '500' }}>
                      {transaction.type === 'income' ? transaction.source : transaction.beneficiary}
                    </div>
                    {(transaction.sourceEmail || transaction.beneficiaryEmail) && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {transaction.sourceEmail || transaction.beneficiaryEmail}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        fontWeight: '700',
                        fontSize: '1rem',
                        color: transaction.type === 'income' ? 'var(--brand-turquoise)' : 'var(--brand-bordeaux)',
                      }}
                    >
                      {transaction.type === 'income' ? '+' : '-'} R${transaction.amount.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color, icon }: { title: string; value: string | number; color: string; icon: string }) {
  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>{title}</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</p>
        </div>
        <div
          style={{
            width: '48px',
            height: '48px',
            background: `${color}15`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: string }) {
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
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function TransactionTypeBadge({ type }: { type: 'income' | 'expense' }) {
  const config = {
    income: { label: 'Receita', bg: 'var(--brand-turquoise)15', color: 'var(--brand-turquoise)', icon: '↑' },
    expense: { label: 'Despesa', bg: 'var(--brand-bordeaux)15', color: 'var(--brand-bordeaux)', icon: '↓' },
  };
  const c = config[type];
  return (
    <span
      style={{
        padding: '0.25rem 0.75rem',
        background: c.bg,
        color: c.color,
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}
    >
      <span style={{ fontSize: '0.9rem' }}>{c.icon}</span>
      {c.label}
    </span>
  );
}

function CategoryBadge({ category, label }: { category: string; label: string }) {
  const icons: { [key: string]: string } = {
    tour_sale: '🎫',
    receivable: '💵',
    salary: '👤',
    vendor: '🏢',
  };
  return (
    <span
      style={{
        padding: '0.25rem 0.75rem',
        background: 'var(--gray-100)',
        color: 'var(--gray-700)',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}
    >
      <span>{icons[category] || '📋'}</span>
      {label}
    </span>
  );
}

const thStyle = {
  padding: '0.75rem 1rem',
  textAlign: 'left' as const,
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--gray-700)',
};

const tdStyle = {
  padding: '1rem',
  fontSize: '0.875rem',
  color: 'var(--gray-800)',
};
