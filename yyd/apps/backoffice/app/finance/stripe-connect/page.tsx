'use client';

import { useEffect, useState } from 'react';

type GuideBalance = {
  guideId: string;
  guideName: string;
  email: string;
  stripeAccountId: string | null;
  accountStatus: string | null;
  onboardingCompleted: boolean;
  available: number;
  pending: number;
};

export default function StripeConnectPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [balances, setBalances] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/guides');
      if (res.ok) {
        const data = await res.json();
        setGuides(data);
        
        // Load balances for guides with Stripe accounts
        for (const guide of data) {
          if (guide.stripeConnectedAccountId) {
            loadBalance(guide.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async (guideId: string) => {
    try {
      const res = await fetch(`/api/stripe-connect/balance?guideId=${guideId}`);
      if (res.ok) {
        const data = await res.json();
        setBalances((prev) => new Map(prev).set(guideId, data));
      }
    } catch (error) {
      console.error(`Failed to load balance for guide ${guideId}:`, error);
    }
  };

  const createAccount = async (guideId: string) => {
    setProcessing(guideId);
    setMessage(null);
    try {
      const res = await fetch('/api/stripe-connect/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        loadGuides();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setProcessing(null);
    }
  };

  const generateOnboardingLink = async (guideId: string) => {
    setProcessing(guideId);
    setMessage(null);
    try {
      const res = await fetch('/api/stripe-connect/onboarding-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        window.open(data.url, '_blank');
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setProcessing(null);
    }
  };

  const generateLoginLink = async (guideId: string) => {
    setProcessing(guideId);
    setMessage(null);
    try {
      const res = await fetch('/api/stripe-connect/login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        window.open(data.url, '_blank');
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setProcessing(null);
    }
  };

  const refreshBalance = async (guideId: string) => {
    setProcessing(guideId);
    await loadBalance(guideId);
    setProcessing(null);
  };

  const totalAvailable = Array.from(balances.values()).reduce(
    (sum, b) => sum + (b.totalAvailable || 0),
    0
  );

  const accountsWithBalance = balances.size;

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          💰 Stripe Connect - Pagamentos de Guias
        </h1>
        <p style={{ color: '#6b7280' }}>
          Gerencie contas Stripe dos guias e processe pagamentos
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '0.5rem',
            background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Disponível</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1fb7c4' }}>
            €{totalAvailable.toFixed(2)}
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Contas Ativas</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7e3231' }}>
            {accountsWithBalance}
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total de Guias</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a' }}>
            {guides.length}
          </div>
        </div>
      </div>

      {/* Guides Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          Carregando...
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Guia
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Status Conta
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Saldo Disponível
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Saldo Pendente
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide) => {
                const balance = balances.get(guide.id);
                const hasAccount = !!guide.stripeConnectedAccountId;
                const isProcessing = processing === guide.id;

                return (
                  <tr key={guide.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{guide.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{guide.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {hasAccount ? (
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: guide.stripeOnboardingCompleted ? '#d1fae5' : '#fef3c7',
                            color: guide.stripeOnboardingCompleted ? '#065f46' : '#92400e',
                          }}
                        >
                          {guide.stripeOnboardingCompleted ? '✓ Ativa' : '⏳ Onboarding'}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Sem conta</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {balance ? (
                        <span style={{ fontWeight: '600', color: '#1fb7c4' }}>
                          €{balance.totalAvailable?.toFixed(2) || '0.00'}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {balance && balance.pending?.length > 0 ? (
                        <span style={{ color: '#f59e0b' }}>
                          €{balance.pending[0].amount?.toFixed(2) || '0.00'}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {!hasAccount && (
                          <button
                            onClick={() => createAccount(guide.id)}
                            disabled={isProcessing}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: 'white',
                              background: '#1fb7c4',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: isProcessing ? 'not-allowed' : 'pointer',
                              opacity: isProcessing ? 0.5 : 1,
                            }}
                          >
                            {isProcessing ? 'Processando...' : 'Criar Conta'}
                          </button>
                        )}

                        {hasAccount && !guide.stripeOnboardingCompleted && (
                          <button
                            onClick={() => generateOnboardingLink(guide.id)}
                            disabled={isProcessing}
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: 'white',
                              background: '#f59e0b',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: isProcessing ? 'not-allowed' : 'pointer',
                              opacity: isProcessing ? 0.5 : 1,
                            }}
                          >
                            {isProcessing ? 'Processando...' : 'Completar Onboarding'}
                          </button>
                        )}

                        {hasAccount && guide.stripeOnboardingCompleted && (
                          <>
                            <button
                              onClick={() => generateLoginLink(guide.id)}
                              disabled={isProcessing}
                              style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#1fb7c4',
                                background: 'white',
                                border: '1px solid #1fb7c4',
                                borderRadius: '0.375rem',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                opacity: isProcessing ? 0.5 : 1,
                              }}
                            >
                              Ver Dashboard
                            </button>

                            <button
                              onClick={() => refreshBalance(guide.id)}
                              disabled={isProcessing}
                              style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#6b7280',
                                background: 'white',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                opacity: isProcessing ? 0.5 : 1,
                              }}
                            >
                              🔄
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {guides.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              Nenhum guia cadastrado.
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1e40af' }}>
          📖 Como Funciona
        </h3>
        <ol style={{ marginLeft: '1.5rem', color: '#1e3a8a', lineHeight: '1.75' }}>
          <li><strong>Criar Conta:</strong> Cria uma conta Stripe Express para o guia</li>
          <li><strong>Completar Onboarding:</strong> Guia preenche dados bancários e documentos no Stripe</li>
          <li><strong>Processar Pagamento:</strong> Vá para Payroll e clique em "Pagar via Stripe Connect"</li>
          <li><strong>Ver Dashboard:</strong> Guia pode acessar seu dashboard Stripe para ver saldo e fazer payouts</li>
        </ol>
      </div>
    </div>
  );
}
