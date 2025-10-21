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
    currency: 'EUR',
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
    if (!confirm('Are you sure? This will fail if the account has ledger entries.')) return;

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
      currency: 'EUR',
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Chart of Accounts</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Manage your accounting accounts (asset, liability, equity, revenue, expense)
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          + New Account
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
            {editingId ? 'Edit Account' : 'New Account'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Code *
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
                  placeholder="e.g., 1100"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Name *
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
                  placeholder="e.g., Cash"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Type *
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
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                  <option value="equity">Equity</option>
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Category
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
                  placeholder="e.g., Current Assets"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Currency
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
                  <option value="EUR">EUR</option>
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
                  Active
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
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                }}
              >
                {editingId ? 'Update' : 'Create'}
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
            <option value="">All Types</option>
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
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
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Loading...</p>
        ) : accounts.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No accounts found</p>
        ) : (
          <table style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Code</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Category</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>Balance</th>
                <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: '600' }}>Entries</th>
                <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{account.code}</td>
                  <td style={{ padding: '0.75rem' }}>{account.name}</td>
                  <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{account.type}</td>
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
                      {account.active ? 'Active' : 'Inactive'}
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
                      Edit
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
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
