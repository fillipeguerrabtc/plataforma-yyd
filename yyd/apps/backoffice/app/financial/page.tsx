'use client';

import { useEffect, useState } from 'react';

type Tab = 'overview' | 'payables' | 'receivables' | 'reconciliation';
type TransactionFilter = 'all' | 'income' | 'expense';

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [payables, setPayables] = useState<any[]>([]);
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Transaction history states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<any>(null);
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>('all');
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'overview') {
      loadTransactions();
    }
  }, [activeTab, transactionFilter]);

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

  async function loadTransactions() {
    setTransactionsLoading(true);
    try {
      const url = `/api/financial/transactions?type=${transactionFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setTransactionSummary(data.summary || {});
    } catch (error) {
      console.error('Load transactions error:', error);
    } finally {
      setTransactionsLoading(false);
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
          {activeTab === 'overview' && overview && (
            <OverviewView 
              data={overview} 
              transactions={transactions}
              transactionSummary={transactionSummary}
              transactionFilter={transactionFilter}
              setTransactionFilter={setTransactionFilter}
              transactionsLoading={transactionsLoading}
            />
          )}
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

function OverviewView({ data, transactions, transactionSummary, transactionFilter, setTransactionFilter, transactionsLoading }: { 
  data: any; 
  transactions: any[];
  transactionSummary: any;
  transactionFilter: TransactionFilter;
  setTransactionFilter: (filter: TransactionFilter) => void;
  transactionsLoading: boolean;
}) {
  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard
          title="Receita Total"
          value={`R$${Number(data.summary.totalRevenue).toFixed(2)}`}
          color="var(--brand-turquoise)"
          icon="💰"
        />
        <StatCard
          title="Despesas Totais"
          value={`R$${Number(data.summary.totalExpenses).toFixed(2)}`}
          color="var(--brand-bordeaux)"
          icon="💸"
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

      {/* Transaction History Section */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--brand-black)', marginBottom: '1.5rem' }}>
          📊 Histórico de Transações
        </h2>

        {/* Transaction Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--gray-200)' }}>
          <TransactionTabButton
            label="Todas"
            active={transactionFilter === 'all'}
            onClick={() => setTransactionFilter('all')}
            icon="📊"
          />
          <TransactionTabButton
            label="Receitas"
            active={transactionFilter === 'income'}
            onClick={() => setTransactionFilter('income')}
            icon="💰"
          />
          <TransactionTabButton
            label="Despesas"
            active={transactionFilter === 'expense'}
            onClick={() => setTransactionFilter('expense')}
            icon="💸"
          />
        </div>

        {/* Transaction Summary Cards */}
        {transactionSummary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <SmallStatCard
              title="Total de Receitas"
              value={`R$${transactionSummary.totalIncome.toFixed(2)}`}
              color="var(--brand-turquoise)"
              icon="💰"
            />
            <SmallStatCard
              title="Total de Despesas"
              value={`R$${transactionSummary.totalExpenses.toFixed(2)}`}
              color="var(--brand-bordeaux)"
              icon="💸"
            />
            <SmallStatCard
              title="Posição Líquida"
              value={`R$${transactionSummary.netPosition.toFixed(2)}`}
              color={transactionSummary.netPosition >= 0 ? 'var(--brand-turquoise)' : 'var(--brand-bordeaux)'}
              icon="📊"
            />
            <SmallStatCard
              title="Total de Transações"
              value={transactionSummary.count}
              color="var(--brand-gold)"
              icon="📋"
            />
          </div>
        )}

        {/* Transactions Table */}
        {transactionsLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
            Carregando transações...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)', background: 'white', borderRadius: '12px' }}>
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

function SmallStatCard({ title, value, color, icon }: { title: string; value: string | number; color: string; icon: string }) {
  return (
    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>{title}</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color }}>{value}</p>
        </div>
        <div style={{ fontSize: '1.25rem' }}>{icon}</div>
      </div>
    </div>
  );
}

function TransactionTabButton({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: string }) {
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
