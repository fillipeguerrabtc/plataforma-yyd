'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  slug: string;
  titlePt: string;
  durationHours: number;
  active: boolean;
  _count: { bookings: number };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja desativar o produto "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Produto desativado com sucesso!');
        fetchProducts();
      } else {
        alert('Erro ao desativar produto');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erro ao desativar produto');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
            📦 Produtos e Tours
          </h1>
          <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            Gerencie produtos, atividades e preços sazonais
          </p>
        </div>
        <Link
          href="/products/new"
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--brand-turquoise)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          + Criar Produto
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-100)', borderBottom: '1px solid var(--gray-200)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Título</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Duração</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Reservas</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--brand-black)' }}>{product.titlePt}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>{product.slug}</div>
                </td>
                <td style={{ padding: '1rem', color: 'var(--gray-700)' }}>{product.durationHours}h</td>
                <td style={{ padding: '1rem', color: 'var(--gray-700)' }}>{product._count.bookings}</td>
                <td style={{ padding: '1rem' }}>
                  {product.active ? (
                    <span style={{ padding: '0.25rem 0.75rem', background: 'var(--brand-turquoise)15', color: 'var(--brand-turquoise)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                      Ativo
                    </span>
                  ) : (
                    <span style={{ padding: '0.25rem 0.75rem', background: 'var(--gray-200)', color: 'var(--gray-700)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                      Inativo
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Link
                      href={`/products/${product.id}`}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--brand-black)',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        textDecoration: 'none',
                      }}
                    >
                      Editar
                    </Link>
                    {product.active && (
                      <button
                        onClick={() => handleDelete(product.id, product.titlePt)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#DC2626',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Desativar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
            Nenhum produto encontrado. Crie seu primeiro produto!
          </div>
        )}
      </div>
    </div>
  );
}
