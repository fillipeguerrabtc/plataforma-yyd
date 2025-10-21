'use client';

import { useState, useEffect } from 'react';

interface SeasonPrice {
  id: string;
  season: string;
  tier: string;
  startMonth: number;
  endMonth: number;
  minPeople: number;
  maxPeople: number | null;
  priceEur: number;
  pricePerPerson: boolean;
}

export default function TourPricesManager({ tourId }: { tourId: string }) {
  const [prices, setPrices] = useState<SeasonPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SeasonPrice>>({
    season: 'high',
    tier: '1-2',
    startMonth: 5,
    endMonth: 10,
    minPeople: 1,
    maxPeople: 2,
    priceEur: 0,
    pricePerPerson: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPrices();
  }, [tourId]);

  const fetchPrices = async () => {
    try {
      const response = await fetch(`/api/tours/${tourId}/prices`);
      if (response.ok) {
        const data = await response.json();
        setPrices(data.prices);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/tours/${tourId}/prices/${editingId}`
        : `/api/tours/${tourId}/prices`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchPrices();
        setShowForm(false);
        setEditingId(null);
        resetForm();
      } else {
        alert('Erro ao salvar preço');
      }
    } catch (error) {
      console.error('Error saving price:', error);
      alert('Erro ao salvar preço');
    }
  };

  const handleDelete = async (priceId: string) => {
    if (!confirm('Tem certeza que deseja deletar este preço?')) return;

    try {
      const response = await fetch(`/api/tours/${tourId}/prices/${priceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPrices();
      } else {
        alert('Erro ao deletar preço');
      }
    } catch (error) {
      console.error('Error deleting price:', error);
      alert('Erro ao deletar preço');
    }
  };

  const handleEdit = (price: SeasonPrice) => {
    setFormData(price);
    setEditingId(price.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      season: 'high',
      tier: '1-2',
      startMonth: 5,
      endMonth: 10,
      minPeople: 1,
      maxPeople: 2,
      priceEur: 0,
      pricePerPerson: false,
    });
  };

  if (loading) {
    return <div>Carregando preços...</div>;
  }

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          💰 Preços Sazonais
        </h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            resetForm();
          }}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--brand-turquoise)',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancelar' : '+ Adicionar Preço'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Temporada</label>
              <input
                type="text"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                style={inputStyle}
                placeholder="high"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Tier (ex: 1-2, 3-4)</label>
              <input
                type="text"
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                style={inputStyle}
                placeholder="1-2"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Mês Início (1-12)</label>
              <input
                type="number"
                value={formData.startMonth}
                onChange={(e) => setFormData({ ...formData, startMonth: parseInt(e.target.value) })}
                style={inputStyle}
                min="1"
                max="12"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Mês Fim (1-12)</label>
              <input
                type="number"
                value={formData.endMonth}
                onChange={(e) => setFormData({ ...formData, endMonth: parseInt(e.target.value) })}
                style={inputStyle}
                min="1"
                max="12"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Mín Pessoas</label>
              <input
                type="number"
                value={formData.minPeople}
                onChange={(e) => setFormData({ ...formData, minPeople: parseInt(e.target.value) })}
                style={inputStyle}
                min="1"
                max="36"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Máx Pessoas</label>
              <input
                type="number"
                value={formData.maxPeople || ''}
                onChange={(e) => setFormData({ ...formData, maxPeople: e.target.value ? parseInt(e.target.value) : null })}
                style={inputStyle}
                min="1"
                max="36"
              />
            </div>
            <div>
              <label style={labelStyle}>Preço (€)</label>
              <input
                type="number"
                value={formData.priceEur}
                onChange={(e) => setFormData({ ...formData, priceEur: parseFloat(e.target.value) })}
                style={inputStyle}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.pricePerPerson}
                  onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Por pessoa</span>
              </label>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1.5rem',
                background: 'var(--brand-turquoise)',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                resetForm();
              }}
              style={{
                padding: '0.5rem 1.5rem',
                background: 'var(--gray-200)',
                color: 'var(--gray-700)',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {prices.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--gray-600)', padding: '2rem' }}>
          Nenhum preço cadastrado. Clique em "Adicionar Preço" para começar.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {prices.map((price) => (
            <div
              key={price.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid var(--gray-200)',
                borderRadius: '8px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                    {price.season} (M{price.startMonth}-{price.endMonth})
                  </span>
                  <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                    Tier: {price.tier}
                  </span>
                  <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                    {price.minPeople}{price.maxPeople ? `-${price.maxPeople}` : '+'} pessoas
                  </span>
                  <span style={{ fontWeight: '700', color: 'var(--brand-turquoise)', fontSize: '1rem' }}>
                    €{Number(price.priceEur).toFixed(2)}{price.pricePerPerson ? '/p' : ''}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(price)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    background: 'var(--brand-black)',
                    color: 'white',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(price.id)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    background: 'var(--brand-burgundy)',
                    color: 'white',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--gray-700)',
  marginBottom: '0.5rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid var(--gray-300)',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
};
