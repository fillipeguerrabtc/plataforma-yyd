'use client';

import { useState, useEffect } from 'react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/financial/reports?start=${dateRange.start}&end=${dateRange.end}`);
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const cardStyle = {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid var(--gray-200)',
  };

  const IVA_RATE = 0.23;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
        📊 Relatórios Financeiros
      </h1>
      <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
        IVA, Lucro & Prejuízo, Fluxo de Caixa
      </p>

      <div style={{ ...cardStyle, marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Data Início
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              style={{
                padding: '0.75rem',
                border: '1px solid var(--gray-300)',
                borderRadius: '6px',
                fontSize: '0.875rem',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Data Fim
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              style={{
                padding: '0.75rem',
                border: '1px solid var(--gray-300)',
                borderRadius: '6px',
                fontSize: '0.875rem',
              }}
            />
          </div>
          <button
            onClick={loadReport}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--brand-turquoise)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '1.5rem',
            }}
          >
            Gerar Relatório
          </button>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>Carregando...</div>}

      {!loading && reportData && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={cardStyle}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
                RECEITA TOTAL
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--brand-turquoise)' }}>
                R${Number(reportData.revenue || 0).toFixed(2)}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
                DESPESAS TOTAIS
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--brand-bordeaux)' }}>
                R${Number(reportData.expenses || 0).toFixed(2)}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
                LUCRO LÍQUIDO
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: (reportData.revenue || 0) - (reportData.expenses || 0) >= 0 ? '#10b981' : '#ef4444',
                }}
              >
                R${((reportData.revenue || 0) - (reportData.expenses || 0)).toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              💶 Relatório IVA (23%)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                  BASE TRIBUTÁVEL
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                  R${((reportData.revenue || 0) / (1 + IVA_RATE)).toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                  IVA COBRADO
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--brand-turquoise)' }}>
                  R${((reportData.revenue || 0) - (reportData.revenue || 0) / (1 + IVA_RATE)).toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                  IVA DEDUTÍVEL
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f59e0b' }}>
                  R${((reportData.expenses || 0) - (reportData.expenses || 0) / (1 + IVA_RATE)).toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                  IVA A PAGAR
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--brand-bordeaux)' }}>
                  R$
                  {(
                    (reportData.revenue || 0) / (1 + IVA_RATE) * IVA_RATE -
                    (reportData.expenses || 0) / (1 + IVA_RATE) * IVA_RATE
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              📈 Demonstração de Resultados (P&L)
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
              Valores líquidos (ex-IVA a 23%). Consulte o Relatório IVA acima para detalhes do IVA.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: '600' }}>Receita Líquida (ex-IVA)</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: '700', color: 'var(--brand-turquoise)' }}>
                    R${((reportData.revenue || 0) / (1 + IVA_RATE)).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '2px solid var(--gray-300)' }}>
                  <td style={{ padding: '1rem 0', paddingLeft: '2rem', color: 'var(--gray-600)' }}>(-) Custos Operacionais (ex-IVA)</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', color: 'var(--brand-bordeaux)' }}>
                    R${((reportData.expenses || 0) / (1 + IVA_RATE)).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem 0', fontWeight: '700', fontSize: '1.125rem' }}>LUCRO LÍQUIDO</td>
                  <td
                    style={{
                      padding: '1rem 0',
                      textAlign: 'right',
                      fontWeight: '700',
                      fontSize: '1.125rem',
                      color: ((reportData.revenue || 0) / (1 + IVA_RATE) - (reportData.expenses || 0) / (1 + IVA_RATE)) >= 0 ? '#10b981' : '#ef4444',
                    }}
                  >
                    R${(((reportData.revenue || 0) / (1 + IVA_RATE)) - ((reportData.expenses || 0) / (1 + IVA_RATE))).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              💸 Fluxo de Caixa
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: '600' }}>Entradas de Caixa</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: '700', color: '#10b981' }}>
                    R${Number(reportData.cashIn || reportData.revenue || 0).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: '600' }}>Saídas de Caixa</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: '700', color: '#ef4444' }}>
                    R${Number(reportData.cashOut || reportData.expenses || 0).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ borderTop: '2px solid var(--gray-300)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: '700', fontSize: '1.125rem' }}>FLUXO DE CAIXA LÍQUIDO</td>
                  <td
                    style={{
                      padding: '1rem 0',
                      textAlign: 'right',
                      fontWeight: '700',
                      fontSize: '1.125rem',
                      color:
                        (reportData.cashIn || reportData.revenue || 0) - (reportData.cashOut || reportData.expenses || 0) >= 0
                          ? '#10b981'
                          : '#ef4444',
                    }}
                  >
                    R${((reportData.cashIn || reportData.revenue || 0) - (reportData.cashOut || reportData.expenses || 0)).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
