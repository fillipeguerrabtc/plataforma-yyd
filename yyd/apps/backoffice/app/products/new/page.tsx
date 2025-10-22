'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    titleEn: '',
    titlePt: '',
    titleEs: '',
    descriptionEn: '',
    descriptionPt: '',
    descriptionEs: '',
    durationHours: 4,
    maxGroupSize: 6,
    categoryEn: 'Tour',
    categoryPt: 'Passeio',
    categoryEs: 'Tour',
    bestChoice: false,
    active: true,
    includeMonuments: false,
    minActivities: 1,
    maxActivities: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const product = await res.json();
        router.push(`/products/${product.id}`);
      } else {
        alert('Erro ao criar produto');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link
          href="/products"
          style={{
            padding: '0.5rem',
            background: 'var(--gray-200)',
            borderRadius: '6px',
            display: 'inline-flex',
            textDecoration: 'none',
          }}
        >
          ← Voltar
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          Criar Novo Produto
        </h1>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '1200px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
                Informações Básicas
              </h3>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ex: half-day-tour"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Título (Inglês) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Título (Português) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titlePt}
                  onChange={(e) => setFormData({ ...formData, titlePt: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Título (Espanhol) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titleEs}
                  onChange={(e) => setFormData({ ...formData, titleEs: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Duração (horas) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="24"
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Tamanho Máximo do Grupo *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.maxGroupSize}
                  onChange={(e) => setFormData({ ...formData, maxGroupSize: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
                Descrições
              </h3>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Descrição (Inglês) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Descrição (Português) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.descriptionPt}
                  onChange={(e) => setFormData({ ...formData, descriptionPt: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Descrição (Espanhol) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.descriptionEs}
                  onChange={(e) => setFormData({ ...formData, descriptionEs: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--gray-300)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.bestChoice}
                    onChange={(e) => setFormData({ ...formData, bestChoice: e.target.checked })}
                  />
                  <span>Melhor Escolha</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.includeMonuments}
                    onChange={(e) => setFormData({ ...formData, includeMonuments: e.target.checked })}
                  />
                  <span>Inclui Monumentos</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span>Ativo</span>
                </label>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Link
              href="/products"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--gray-200)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--gray-700)',
              }}
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: loading ? 'var(--gray-400)' : 'var(--brand-turquoise)',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Criando...' : 'Criar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
