'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TourFormData {
  titlePt: string;
  titleEn: string;
  titleEs: string;
  descriptionPt: string;
  descriptionEn: string;
  descriptionEs: string;
  categoryPt: string;
  categoryEn: string;
  categoryEs: string;
  durationHours: number;
  maxGroupSize: number;
  bestChoice: boolean;
  active: boolean;
  slug: string;
  imageUrl: string;
}

export default function TourForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TourFormData>(initialData || {
    titlePt: '',
    titleEn: '',
    titleEs: '',
    descriptionPt: '',
    descriptionEn: '',
    descriptionEs: '',
    categoryPt: '',
    categoryEn: '',
    categoryEs: '',
    durationHours: 4,
    maxGroupSize: 6,
    bestChoice: false,
    active: true,
    slug: '',
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData ? `/api/tours/${initialData.id}` : '/api/tours';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/tours');
        router.refresh();
      } else {
        alert('Erro ao salvar tour');
      }
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Erro ao salvar tour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          🇵🇹 Português (PT-BR)
        </h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Título</label>
            <input
              type="text"
              value={formData.titlePt}
              onChange={(e) => setFormData({ ...formData, titlePt: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Categoria</label>
            <input
              type="text"
              value={formData.categoryPt}
              onChange={(e) => setFormData({ ...formData, categoryPt: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea
              value={formData.descriptionPt}
              onChange={(e) => setFormData({ ...formData, descriptionPt: e.target.value })}
              style={{ ...inputStyle, minHeight: '120px' }}
              required
            />
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          🇬🇧 English (EN)
        </h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <input
              type="text"
              value={formData.categoryEn}
              onChange={(e) => setFormData({ ...formData, categoryEn: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              style={{ ...inputStyle, minHeight: '120px' }}
              required
            />
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          🇪🇸 Español (ES)
        </h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Título</label>
            <input
              type="text"
              value={formData.titleEs}
              onChange={(e) => setFormData({ ...formData, titleEs: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Categoría</label>
            <input
              type="text"
              value={formData.categoryEs}
              onChange={(e) => setFormData({ ...formData, categoryEs: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea
              value={formData.descriptionEs}
              onChange={(e) => setFormData({ ...formData, descriptionEs: e.target.value })}
              style={{ ...inputStyle, minHeight: '120px' }}
              required
            />
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          ⚙️ Configurações Gerais
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Slug (URL)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              style={inputStyle}
              placeholder="sintra-half-day"
              required
            />
          </div>
          <div>
            <label style={labelStyle}>URL da Imagem</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              style={inputStyle}
              placeholder="https://..."
            />
          </div>
          <div>
            <label style={labelStyle}>Duração (horas)</label>
            <input
              type="number"
              value={formData.durationHours}
              onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) })}
              style={inputStyle}
              min="1"
              max="12"
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Tamanho Máximo do Grupo</label>
            <input
              type="number"
              value={formData.maxGroupSize}
              onChange={(e) => setFormData({ ...formData, maxGroupSize: parseInt(e.target.value) })}
              style={inputStyle}
              min="1"
              max="36"
              required
            />
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.bestChoice}
              onChange={(e) => setFormData({ ...formData, bestChoice: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>⭐ Best Choice</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>✅ Ativo</span>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 2rem',
            background: loading ? 'var(--gray-400)' : 'var(--brand-turquoise)',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Salvando...' : initialData ? 'Atualizar Tour' : 'Criar Tour'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            padding: '0.75rem 2rem',
            background: 'var(--gray-200)',
            color: 'var(--gray-700)',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
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
  padding: '0.75rem',
  border: '1px solid var(--gray-300)',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
};
