'use client';

import { useState, useEffect } from 'react';

type Account = {
  id: string;
  code: string;
  name: string;
  type: string;
  category?: string;
  balance: number;
  currency: string;
  active: boolean;
  _count?: { ledgerEntries: number };
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'asset',
    category: '',
    currency: 'BRL',
    active: true,
  });

  useEffect(() => {
    loadAccounts();
  }, [typeFilter, activeFilter]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (activeFilter) params.append('active', activeFilter);

      const res = await fetch(`/api/financial/accounts?${params.toString()}`);
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingId
      ? `/api/financial/accounts/${editingId}`
      : '/api/financial/accounts';
    const method = editingId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to save account');
        return;
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadAccounts();
    } catch (error) {
      console.error('Failed to save account:', error);
      alert('Failed to save account');
    }
  };

  const handleEdit = (account: Account) => {
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      category: account.category || '',
      currency: account.currency,
      active: account.active,
    });
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza? Isso falhará se a conta tiver lançamentos contábeis.')) return;

    try {
      const res = await fetch(`/api/financial/accounts/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to delete account');
        return;
      }

      loadAccounts();
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'asset',
      category: '',
      currency: 'BRL',
      active: true,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Plano de Contas</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Gerencie suas contas contábeis (ativo, passivo, patrimônio líquido, receita, despesa)
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '0.5rem 1rem',
            background: '#1FB7C4',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          + Nova Conta
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            {editingId ? 'Editar Conta' : 'Nova Conta'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                  placeholder="ex: 1100"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                  placeholder="ex: Caixa"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="asset">Ativo</option>
                  <option value="liability">Passivo</option>
                  <option value="equity">Patrimônio Líquido</option>
                  <option value="revenue">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Categoria
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                  placeholder="ex: Ativos Circulantes"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Moeda
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  style={{ marginRight: '0.5rem' }}
                />
                <label htmlFor="active" style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                  Ativa
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  background: '#1FB7C4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                }}
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
            }}
          >
            <option value="">Todos os Tipos</option>
            <option value="asset">Ativo</option>
            <option value="liability">Passivo</option>
            <option value="equity">Patrimônio Líquido</option>
            <option value="revenue">Receita</option>
            <option value="expense">Despesa</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
            }}
          >
            <option value="">Todos os Status</option>
            <option value="true">Ativa</option>
            <option value="false">Inativa</option>
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Carregando...</p>
        ) : accounts.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Nenhuma conta encontrada</p>
        ) : (
          <table style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Código</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Nome</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Tipo</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Categoria</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>Saldo</th>
                <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: '600' }}>Lançamentos</th>
                <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const typeLabels: Record<string, string> = {
                  asset: 'Ativo',
                  liability: 'Passivo',
                  equity: 'Patrimônio Líquido',
                  revenue: 'Receita',
                  expense: 'Despesa'
                };
                return (
                <tr key={account.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{account.code}</td>
                  <td style={{ padding: '0.75rem' }}>{account.name}</td>
                  <td style={{ padding: '0.75rem' }}>{typeLabels[account.type] || account.type}</td>
                  <td style={{ padding: '0.75rem', color: '#6b7280' }}>{account.category || '-'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontFamily: 'monospace' }}>
                    {account.currency} {Number(account.balance).toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {account._count?.ledgerEntries || 0}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: account.active ? '#d1fae5' : '#fee2e2',
                        color: account.active ? '#065f46' : '#991b1b',
                      }}
                    >
                      {account.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleEdit(account)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        marginRight: '0.5rem',
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#991b1b',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                      }}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
