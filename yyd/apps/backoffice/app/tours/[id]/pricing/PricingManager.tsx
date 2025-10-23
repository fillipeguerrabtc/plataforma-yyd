'use client';

import { useState } from 'react';

interface SeasonPrice {
  id?: string;
  season: string;
  startMonth: number;
  endMonth: number;
  tier: string;
  minPeople: number;
  maxPeople: number | null;
  priceEur: number;
  pricePerPerson: boolean;
}

export default function PricingManager({
  tourId,
  initialPrices,
}: {
  tourId: string;
  initialPrices: any[];
}) {
  const [prices, setPrices] = useState<SeasonPrice[]>(
    initialPrices.map((p) => ({
      ...p,
      priceEur: parseFloat(p.priceEur.toString()),
    }))
  );

  const handleSave = async () => {
    try {
      const payload = {
        prices: prices.map((p) => ({
          season: p.season,
          startMonth: p.startMonth,
          endMonth: p.endMonth,
          tier: p.tier,
          minPeople: p.minPeople,
          maxPeople: p.maxPeople,
          priceEur: p.priceEur,
          pricePerPerson: p.pricePerPerson,
        })),
      };

      const response = await fetch(`/api/tours/${tourId}/pricing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save pricing');

      alert('Preços salvos com sucesso!');
      window.location.reload();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAdd = () => {
    setPrices([
      ...prices,
      {
        season: 'low',
        startMonth: 11,
        endMonth: 4,
        tier: '1-4-people',
        minPeople: 1,
        maxPeople: 4,
        priceEur: 0,
        pricePerPerson: false,
      },
    ]);
  };

  const handleRemove = (index: number) => {
    setPrices(prices.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: string, value: any) => {
    const updated = [...prices];
    updated[index] = { ...updated[index], [field]: value };
    setPrices(updated);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={handleAdd}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--brand-turquoise)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ➕ Adicionar Faixa de Preço
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          💾 Salvar Todos
        </button>
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Temporada</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Início (Mês)</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fim (Mês)</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Faixa</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Min Pessoas</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Max Pessoas</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Preço (R$)</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Por Pessoa?</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((price, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>
                  <select
                    value={price.season}
                    onChange={(e) => handleUpdate(index, 'season', e.target.value)}
                    style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  >
                    <option value="low">Baixa (Nov-Abr)</option>
                    <option value="high">Alta (Mai-Out)</option>
                  </select>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <input
                    type="number"
                    value={price.startMonth}
                    onChange={(e) => handleUpdate(index, 'startMonth', parseInt(e.target.value))}
                    min="1"
                    max="12"
                    style={{ width: '60px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <input
                    type="number"
                    value={price.endMonth}
                    onChange={(e) => handleUpdate(index, 'endMonth', parseInt(e.target.value))}
                    min="1"
                    max="12"
                    style={{ width: '60px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <input
                    type="text"
                    value={price.tier}
                    onChange={(e) => handleUpdate(index, 'tier', e.target.value)}
                    style={{ width: '120px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <input
                    type="number"
                    value={price.minPeople}
                    onChange={(e) => handleUpdate(index, 'minPeople', parseInt(e.target.value))}
                    min="1"
                    style={{ width: '60px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <input
                    type="number"
                    value={price.maxPeople || ''}
                    onChange={(e) =>
                      handleUpdate(index, 'maxPeople', e.target.value ? parseInt(e.target.value) : null)
                    }
                    min="1"
                    style={{ width: '60px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <input
                    type="number"
                    value={price.priceEur}
                    onChange={(e) => handleUpdate(index, 'priceEur', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    style={{ width: '100px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                  />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={price.pricePerPerson}
                    onChange={(e) => handleUpdate(index, 'pricePerPerson', e.target.checked)}
                  />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    onClick={() => handleRemove(index)}
                    style={{
                      padding: '0.5rem',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {prices.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            Nenhum preço configurado. Clique em "Adicionar Faixa de Preço" para começar.
          </div>
        )}
      </div>
    </div>
  );
}
