'use client';

import { useEffect, useState } from 'react';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';

type Vendor = {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  category: string;
  bankAccount?: string;
  paymentTerms?: string;
  notes?: string;
  photoUrl?: string;
  status: string;
  totalPaid: number;
  currency: string;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    category: '',
    bankAccount: '',
    paymentTerms: '',
    notes: '',
    photoUrl: '',
    status: 'active',
    currency: 'EUR',
    stripeConnectedAccountId: '',
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vendors');
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingId(vendor.id);
    setShowAddForm(true);
    setFormData({
      name: vendor.name,
      companyName: vendor.companyName || '',
      email: vendor.email,
      phone: vendor.phone || '',
      address: vendor.address || '',
      taxId: vendor.taxId || '',
      category: vendor.category,
      bankAccount: vendor.bankAccount || '',
      paymentTerms: vendor.paymentTerms || '',
      notes: vendor.notes || '',
      photoUrl: vendor.photoUrl || '',
      status: vendor.status,
      currency: vendor.currency,
      stripeConnectedAccountId: (vendor as any).stripeConnectedAccountId || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/vendors/${editingId}` : '/api/vendors';
      const method = editingId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddForm(false);
        resetForm();
        fetchVendors();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to save vendor'}`);
      }
    } catch (error) {
      console.error('Failed to save vendor:', error);
      alert('Failed to save vendor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;

    try {
      const res = await fetch(`/api/vendors/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchVendors();
      }
    } catch (error) {
      console.error('Failed to delete vendor:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      category: '',
      bankAccount: '',
      paymentTerms: '',
      notes: '',
      photoUrl: '',
      status: 'active',
      currency: 'EUR',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>🏢 Gestão de Fornecedores</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          {showAddForm ? 'Cancelar' : '+ Adicionar Fornecedor'}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            {editingId ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Nome da Empresa</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Categoria *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              >
                <option value="">Selecione</option>
                <option value="Maintenance">Manutenção</option>
                <option value="Supplies">Suprimentos</option>
                <option value="Services">Serviços</option>
                <option value="Technology">Tecnologia</option>
                <option value="Marketing">Marketing</option>
                <option value="Other">Outros</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>NIF/Tax ID</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Endereço</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Conta Bancária (IBAN)</label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Stripe Account ID</label>
              <input
                type="text"
                value={formData.stripeConnectedAccountId}
                onChange={(e) => setFormData({ ...formData, stripeConnectedAccountId: e.target.value })}
                placeholder="acct_1234567890ABC"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
              <small style={{ display: 'block', marginTop: '0.25rem', color: '#6b7280', fontSize: '0.875rem' }}>
                💳 Copie do Stripe Connect Dashboard
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Termos de Pagamento</label>
              <input
                type="text"
                placeholder="e.g. 30 dias"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <ProfilePhotoUpload
                currentPhoto={formData.photoUrl}
                onPhotoChange={(photoUrl) => setFormData({ ...formData, photoUrl })}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minHeight: '80px' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              {editingId ? 'Atualizar' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={() => { setShowAddForm(false); resetForm(); }}
              style={{
                padding: '0.5rem 1.5rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Carregando...</p>
      ) : vendors.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>Nenhum fornecedor encontrado</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '0.5rem' }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Nome</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Empresa</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Categoria</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Total Pago</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '500' }}>{vendor.name}</td>
                  <td style={{ padding: '0.75rem' }}>{vendor.companyName || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>{vendor.email}</td>
                  <td style={{ padding: '0.75rem' }}>{vendor.category}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>€{vendor.totalPaid.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: vendor.status === 'active' ? '#d1fae5' : '#fef3c7',
                      color: vendor.status === 'active' ? '#065f46' : '#92400e',
                    }}>
                      {vendor.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(vendor)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
