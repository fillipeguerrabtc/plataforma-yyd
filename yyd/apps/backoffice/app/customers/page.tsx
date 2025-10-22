'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  locale: string;
  photoUrl: string | null;
  notes: string | null;
  totalBookings: number;
  totalSpent: number;
  lastBookingAt: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    locale: 'en',
    photoUrl: '',
    notes: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCustomer
        ? `/api/customers/${editingCustomer.id}`
        : '/api/customers';
      
      const method = editingCustomer ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchCustomers();
        setShowForm(false);
        setEditingCustomer(null);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar cliente');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Erro ao salvar cliente');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      country: customer.country || '',
      locale: customer.locale,
      photoUrl: customer.photoUrl || '',
      notes: customer.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCustomers();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir cliente');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Erro ao excluir cliente');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      country: '',
      locale: 'en',
      photoUrl: '',
      notes: '',
    });
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
            👥 CRM de Clientes
          </h1>
          <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            Gerencie todos os clientes e seu histórico de reservas
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            resetForm();
            setShowForm(true);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--brand-turquoise)',
            color: 'white',
            borderRadius: '8px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          + Adicionar Cliente
        </button>
      </div>

      {showForm && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '12px', 
            width: '90%', 
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  País
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Idioma
                </label>
                <select
                  value={formData.locale}
                  onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '4px',
                  }}
                >
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <ProfilePhotoUpload
                  currentPhotoUrl={formData.photoUrl}
                  onPhotoChange={(url) => setFormData({ ...formData, photoUrl: url })}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCustomer(null);
                    resetForm();
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--gray-200)',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--brand-turquoise)',
                    color: 'white',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {editingCustomer ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-100)' }}>
              <th style={thStyle}>Foto</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Telefone</th>
              <th style={thStyle}>País</th>
              <th style={thStyle}>Total Reservas</th>
              <th style={thStyle}>Total Gasto</th>
              <th style={thStyle}>Última Reserva</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <td style={tdStyle}>
                  {customer.photoUrl ? (
                    <img 
                      src={customer.photoUrl} 
                      alt={customer.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gray-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                      👤
                    </div>
                  )}
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: '600' }}>{customer.name}</div>
                </td>
                <td style={tdStyle}>{customer.email}</td>
                <td style={tdStyle}>{customer.phone || '-'}</td>
                <td style={tdStyle}>{customer.country || '-'}</td>
                <td style={tdStyle}>{customer.totalBookings}</td>
                <td style={tdStyle}>
                  <span style={{ fontWeight: '600', color: 'var(--brand-turquoise)' }}>
                    €{parseFloat(customer.totalSpent.toString())}
                  </span>
                </td>
                <td style={tdStyle}>
                  {customer.lastBookingAt
                    ? new Date(customer.lastBookingAt).toLocaleDateString('pt-BR')
                    : '-'}
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                      href={`/customers/${customer.id}`}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: 'var(--brand-turquoise)',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textDecoration: 'none',
                      }}
                    >
                      Ver
                    </Link>
                    <button
                      onClick={() => handleEdit(customer)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: 'var(--brand-gold)',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: 'var(--brand-burgundy)',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
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
    </div>
  );
}

const thStyle = {
  padding: '0.75rem 1rem',
  textAlign: 'left' as const,
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--gray-700)',
};

const tdStyle = {
  padding: '1rem',
  fontSize: '0.875rem',
  color: 'var(--gray-800)',
};
