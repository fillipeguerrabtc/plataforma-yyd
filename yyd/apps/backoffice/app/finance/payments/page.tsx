'use client';

import { useEffect, useState } from 'react';

type Payment = {
  id: string;
  bookingId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail: string;
  customerName: string;
  productName: string;
  paymentMethod: string;
  createdAt: string;
  paidAt: string | null;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'succeeded' | 'pending' | 'failed'>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/finance/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const totalRevenue = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '✓';
      case 'pending':
        return '⏳';
      case 'failed':
        return '✗';
      default:
        return '•';
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>💳 Pagamentos Recebidos</h1>
        <p style={{ color: '#6b7280' }}>Todos os pagamentos processados via Stripe</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Recebido</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>R${totalRevenue.toFixed(2)}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Pagamentos Bem-Sucedidos</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {payments.filter((p) => p.status === 'succeeded').length}
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Pendentes</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {payments.filter((p) => p.status === 'pending').length}
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Falhados</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
            {payments.filter((p) => p.status === 'failed').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '0.5rem 1rem',
            background: filter === 'all' ? '#1f2937' : 'white',
            color: filter === 'all' ? 'white' : '#1f2937',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('succeeded')}
          style={{
            padding: '0.5rem 1rem',
            background: filter === 'succeeded' ? '#10b981' : 'white',
            color: filter === 'succeeded' ? 'white' : '#10b981',
            border: '1px solid #10b981',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Bem-Sucedidos
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            padding: '0.5rem 1rem',
            background: filter === 'pending' ? '#f59e0b' : 'white',
            color: filter === 'pending' ? 'white' : '#f59e0b',
            border: '1px solid #f59e0b',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Pendentes
        </button>
        <button
          onClick={() => setFilter('failed')}
          style={{
            padding: '0.5rem 1rem',
            background: filter === 'failed' ? '#ef4444' : 'white',
            color: filter === 'failed' ? 'white' : '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Falhados
        </button>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Carregando...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Cliente</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Produto</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Valor</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Método</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Data</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Stripe ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}
                      className={getStatusColor(payment.status)}
                    >
                      {getStatusIcon(payment.status)} {payment.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: '500' }}>{payment.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{payment.customerEmail}</div>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{payment.productName}</td>
                  <td style={{ padding: '0.75rem', fontWeight: '600', fontSize: '1rem' }}>
                    R${payment.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{payment.paymentMethod || 'card'}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                    {new Date(payment.paidAt || payment.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <code style={{ fontSize: '0.75rem', background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                      {payment.stripePaymentIntentId}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPayments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              Nenhum pagamento encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
