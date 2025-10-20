'use client';

import { useState } from 'react';

interface Activity {
  id: string;
  nameEn: string;
  namePt: string;
  nameEs: string;
  descriptionEn: string;
  descriptionPt: string;
  descriptionEs: string;
  imageUrl?: string;
  sortOrder: number;
  active: boolean;
}

export default function ActivityManager({
  tourId,
  initialActivities,
}: {
  tourId: string;
  initialActivities: Activity[];
}) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [editing, setEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: '',
    namePt: '',
    nameEs: '',
    descriptionEn: '',
    descriptionPt: '',
    descriptionEs: '',
    imageUrl: '',
    sortOrder: activities.length + 1,
    active: true,
  });

  const handleSave = async () => {
    try {
      const payload = {
        activities: activities.map((a, index) => ({
          nameEn: a.nameEn,
          namePt: a.namePt,
          nameEs: a.nameEs,
          descriptionEn: a.descriptionEn,
          descriptionPt: a.descriptionPt,
          descriptionEs: a.descriptionEs,
          imageUrl: a.imageUrl,
          sortOrder: index + 1,
          active: a.active,
        })),
      };

      const response = await fetch(`/api/tours/${tourId}/activities`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save activities');

      alert('Atividades salvas com sucesso!');
      window.location.reload();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAdd = () => {
    setActivities([
      ...activities,
      {
        id: `new-${Date.now()}`,
        ...formData,
      },
    ]);
    setFormData({
      nameEn: '',
      namePt: '',
      nameEs: '',
      descriptionEn: '',
      descriptionPt: '',
      descriptionEs: '',
      imageUrl: '',
      sortOrder: activities.length + 2,
      active: true,
    });
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    setActivities(activities.filter((a) => a.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newActivities = [...activities];
    [newActivities[index - 1], newActivities[index]] = [newActivities[index], newActivities[index - 1]];
    setActivities(newActivities);
  };

  const moveDown = (index: number) => {
    if (index === activities.length - 1) return;
    const newActivities = [...activities];
    [newActivities[index + 1], newActivities[index]] = [newActivities[index], newActivities[index + 1]];
    setActivities(newActivities);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--brand-turquoise)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {isAdding ? 'Cancelar' : '➕ Adicionar Atividade'}
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          💾 Salvar Todas
        </button>
      </div>

      {isAdding && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Nova Atividade</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Nome (PT)"
              value={formData.namePt}
              onChange={(e) => setFormData({ ...formData, namePt: e.target.value })}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <input
              type="text"
              placeholder="Nome (EN)"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <input
              type="text"
              placeholder="Nome (ES)"
              value={formData.nameEs}
              onChange={(e) => setFormData({ ...formData, nameEs: e.target.value })}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <textarea
              placeholder="Descrição (PT)"
              value={formData.descriptionPt}
              onChange={(e) => setFormData({ ...formData, descriptionPt: e.target.value })}
              rows={3}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <textarea
              placeholder="Descrição (EN)"
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              rows={3}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <textarea
              placeholder="Descrição (ES)"
              value={formData.descriptionEs}
              onChange={(e) => setFormData({ ...formData, descriptionEs: e.target.value })}
              rows={3}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <input
              type="text"
              placeholder="URL da Imagem"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <button
              onClick={handleAdd}
              style={{
                padding: '0.75rem',
                background: 'var(--brand-turquoise)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              border: activity.active ? '2px solid var(--brand-turquoise)' : '2px solid #ddd',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {activity.namePt} / {activity.nameEn} / {activity.nameEs}
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  {activity.descriptionPt}
                </p>
                {activity.imageUrl && (
                  <img
                    src={activity.imageUrl}
                    alt={activity.namePt}
                    style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '0.5rem' }}
                  />
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  style={{
                    padding: '0.5rem',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ⬆️
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === activities.length - 1}
                  style={{
                    padding: '0.5rem',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: index === activities.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ⬇️
                </button>
                <button
                  onClick={() => {
                    const updated = activities.map((a) =>
                      a.id === activity.id ? { ...a, active: !a.active } : a
                    );
                    setActivities(updated);
                  }}
                  style={{
                    padding: '0.5rem',
                    background: activity.active ? '#4CAF50' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {activity.active ? '✓' : '✗'}
                </button>
                <button
                  onClick={() => handleRemove(activity.id)}
                  style={{
                    padding: '0.5rem',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
