'use client';

import { useEffect, useState } from 'react';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';
import MultiplePhotoUpload from '@/components/MultiplePhotoUpload';

interface Vehicle {
  id: string;
  name: string;
  vehicleType: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  licensePlate: string | null;
  color: string | null;
  seats: number | null;
  value: number | null;
  ownershipType: string;
  partnerName: string | null;
  partnerContact: string | null;
  status: string;
  notes: string | null;
  photoUrl: string | null;
  additionalPhotos: string[];
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  createdAt: string;
}

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    vehicleType: '',
    brand: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
    seats: '',
    value: '',
    ownershipType: 'owned',
    partnerName: '',
    partnerContact: '',
    status: 'active',
    notes: '',
    photoUrl: '',
    additionalPhotos: [] as string[],
    lastMaintenance: '',
    nextMaintenance: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/fleet');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingVehicle
        ? `/api/fleet/${editingVehicle.id}`
        : '/api/fleet';
      
      const method = editingVehicle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchVehicles();
        setShowForm(false);
        setEditingVehicle(null);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar veículo');
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Erro ao salvar veículo');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      vehicleType: vehicle.vehicleType || '',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year?.toString() || '',
      licensePlate: vehicle.licensePlate || '',
      color: vehicle.color || '',
      seats: vehicle.seats?.toString() || '',
      value: vehicle.value?.toString() || '',
      ownershipType: vehicle.ownershipType,
      partnerName: vehicle.partnerName || '',
      partnerContact: vehicle.partnerContact || '',
      status: vehicle.status,
      notes: vehicle.notes || '',
      photoUrl: vehicle.photoUrl || '',
      additionalPhotos: vehicle.additionalPhotos || [],
      lastMaintenance: vehicle.lastMaintenance ? new Date(vehicle.lastMaintenance).toISOString().split('T')[0] : '',
      nextMaintenance: vehicle.nextMaintenance ? new Date(vehicle.nextMaintenance).toISOString().split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;

    try {
      const response = await fetch(`/api/fleet/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchVehicles();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir veículo');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Erro ao excluir veículo');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      vehicleType: '',
      brand: '',
      model: '',
      year: '',
      licensePlate: '',
      color: '',
      seats: '',
      value: '',
      ownershipType: 'owned',
      partnerName: '',
      partnerContact: '',
      status: 'active',
      notes: '',
      photoUrl: '',
      additionalPhotos: [],
      lastMaintenance: '',
      nextMaintenance: '',
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
            🚗 Gestão de Frota
          </h1>
          <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            Gerencie todos os veículos da empresa
          </p>
        </div>
        <button
          onClick={() => {
            setEditingVehicle(null);
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
          + Adicionar Veículo
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
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Nome do Veículo *
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Tipo de Veículo
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="">Selecione...</option>
                    <option value="tuk-tuk">Tuk-Tuk Elétrico</option>
                    <option value="van">Van</option>
                    <option value="car">Carro</option>
                    <option value="scooter">Scooter</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Ano
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Matrícula
                  </label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Cor
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Assentos
                  </label>
                  <input
                    type="number"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Propriedade
                  </label>
                  <select
                    value={formData.ownershipType}
                    onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="owned">Próprio</option>
                    <option value="partner">Parceiro</option>
                  </select>
                </div>

                {formData.ownershipType === 'partner' && (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Nome do Parceiro
                      </label>
                      <input
                        type="text"
                        value={formData.partnerName}
                        onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '4px',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Contacto do Parceiro
                      </label>
                      <input
                        type="text"
                        value={formData.partnerContact}
                        onChange={(e) => setFormData({ ...formData, partnerContact: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid var(--gray-300)',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="active">Ativo</option>
                    <option value="maintenance">Em Manutenção</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Última Manutenção
                  </label>
                  <input
                    type="date"
                    value={formData.lastMaintenance}
                    onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Próxima Manutenção
                  </label>
                  <input
                    type="date"
                    value={formData.nextMaintenance}
                    onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '4px',
                    }}
                  />
                </div>
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

              <div style={{ marginBottom: '1rem' }}>
                <ProfilePhotoUpload
                  currentPhotoUrl={formData.photoUrl}
                  onPhotoChange={(url) => setFormData({ ...formData, photoUrl: url })}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <MultiplePhotoUpload
                  photos={formData.additionalPhotos}
                  onPhotosChange={(photos) => setFormData({ ...formData, additionalPhotos: photos })}
                  maxPhotos={10}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVehicle(null);
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
                  {editingVehicle ? 'Atualizar' : 'Criar'}
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
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Matrícula</th>
              <th style={thStyle}>Assentos</th>
              <th style={thStyle}>Propriedade</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <td style={tdStyle}>
                  {vehicle.photoUrl ? (
                    <img 
                      src={vehicle.photoUrl} 
                      alt={vehicle.name}
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--gray-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      🚗
                    </div>
                  )}
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: '600' }}>{vehicle.name}</div>
                  {vehicle.brand && vehicle.model && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                      {vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
                    </div>
                  )}
                </td>
                <td style={tdStyle}>{vehicle.vehicleType || '-'}</td>
                <td style={tdStyle}>{vehicle.licensePlate || '-'}</td>
                <td style={tdStyle}>{vehicle.seats || '-'}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: vehicle.ownershipType === 'owned' ? 'var(--brand-turquoise)' : 'var(--brand-gold)',
                    color: 'white',
                  }}>
                    {vehicle.ownershipType === 'owned' ? 'Próprio' : 'Parceiro'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: 
                      vehicle.status === 'active' ? '#10b981' :
                      vehicle.status === 'maintenance' ? '#f59e0b' :
                      '#ef4444',
                    color: 'white',
                  }}>
                    {vehicle.status === 'active' ? 'Ativo' : 
                     vehicle.status === 'maintenance' ? 'Manutenção' : 
                     'Inativo'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(vehicle)}
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
                      onClick={() => handleDelete(vehicle.id)}
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
