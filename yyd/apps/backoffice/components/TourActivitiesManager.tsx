'use client';

import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  nameEn: string;
  namePt: string;
  nameEs: string;
  descriptionEn: string;
  descriptionPt: string;
  descriptionEs: string;
  imageUrl?: string | null;
  sortOrder: number;
  active: boolean;
}

export default function TourActivitiesManager({ tourId }: { tourId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Activity>>({
    nameEn: '',
    namePt: '',
    nameEs: '',
    descriptionEn: '',
    descriptionPt: '',
    descriptionEs: '',
    imageUrl: '',
    sortOrder: 0,
    active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [tourId]);

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/tours/${tourId}/activities`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/tours/${tourId}/activities/${editingId}`
        : `/api/tours/${tourId}/activities`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchActivities();
        setShowForm(false);
        setEditingId(null);
        resetForm();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error || 'Erro ao salvar atividade'}`);
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Erro ao salvar atividade');
    }
  };

  const handleDelete = async (activityId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta atividade?')) return;

    try {
      const response = await fetch(`/api/tours/${tourId}/activities/${activityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchActivities();
      } else {
        alert('Erro ao deletar atividade');
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Erro ao deletar atividade');
    }
  };

  const handleEdit = (activity: Activity) => {
    setFormData(activity);
    setEditingId(activity.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      nameEn: '',
      namePt: '',
      nameEs: '',
      descriptionEn: '',
      descriptionPt: '',
      descriptionEs: '',
      imageUrl: '',
      sortOrder: 0,
      active: true,
    });
  };

  if (loading) {
    return <div>Carregando atividades...</div>;
  }

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          🎯 Atividades do Tour
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
          {showForm ? 'Cancelar' : '+ Adicionar Atividade'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nome (PT)</label>
                <input
                  type="text"
                  value={formData.namePt}
                  onChange={(e) => setFormData({ ...formData, namePt: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Name (EN)</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Nombre (ES)</label>
                <input
                  type="text"
                  value={formData.nameEs}
                  onChange={(e) => setFormData({ ...formData, nameEs: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
            
            <div>
              <label style={labelStyle}>Descrição (PT)</label>
              <textarea
                value={formData.descriptionPt}
                onChange={(e) => setFormData({ ...formData, descriptionPt: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px' }}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Description (EN)</label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px' }}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Descripción (ES)</label>
              <textarea
                value={formData.descriptionEs}
                onChange={(e) => setFormData({ ...formData, descriptionEs: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>URL da Imagem (opcional)</label>
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={inputStyle}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label style={labelStyle}>Ordem</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  style={inputStyle}
                  min="0"
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>✅ Ativa</span>
            </label>
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

      {activities.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--gray-600)', padding: '2rem' }}>
          Nenhuma atividade cadastrada. Clique em "Adicionar Atividade" para começar.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {activities.map((activity) => (
            <div
              key={activity.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                padding: '1rem',
                border: '1px solid var(--gray-200)',
                borderRadius: '8px',
                opacity: activity.active ? 1 : 0.6,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                    {activity.namePt}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    #{activity.sortOrder}
                  </span>
                  {!activity.active && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      (Inativa)
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                  {activity.descriptionPt.substring(0, 150)}...
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(activity)}
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
                  onClick={() => handleDelete(activity.id)}
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
