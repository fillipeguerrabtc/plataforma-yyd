'use client';

import { useEffect, useState } from 'react';

type Segment = {
  id: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  autoUpdate: boolean;
  active: boolean;
  createdAt: string;
  _count?: { members: number };
};

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    filters: '{}',
    autoUpdate: true,
    active: true,
  });

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/segments');
      if (res.ok) {
        const data = await res.json();
        setSegments(data);
      }
    } catch (error) {
      console.error('Failed to fetch segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (segment: Segment) => {
    setEditingId(segment.id);
    setShowAddForm(true);
    setFormData({
      name: segment.name,
      description: segment.description || '',
      filters: JSON.stringify(segment.filters, null, 2),
      autoUpdate: segment.autoUpdate,
      active: segment.active,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const filters = JSON.parse(formData.filters);
      const payload = {
        ...formData,
        filters,
      };

      const url = editingId ? `/api/crm/segments/${editingId}` : '/api/crm/segments';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddForm(false);
        resetForm();
        fetchSegments();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to save segment'}`);
      }
    } catch (error) {
      console.error('Failed to save segment:', error);
      alert('Failed to save segment. Check filters JSON syntax.');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/crm/segments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (res.ok) {
        fetchSegments();
      }
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) return;

    try {
      const res = await fetch(`/api/crm/segments/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchSegments();
      }
    } catch (error) {
      console.error('Failed to delete segment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      filters: '{}',
      autoUpdate: true,
      active: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const filteredSegments = segments.filter((seg) => {
    if (activeFilter === 'active') return seg.active;
    if (activeFilter === 'inactive') return !seg.active;
    return true;
  });

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Customer Segments</h1>
        <button
          onClick={() => {
            if (showAddForm) {
              setShowAddForm(false);
              resetForm();
            } else {
              setShowAddForm(true);
            }
          }}
          style={{
            padding: '0.5rem 1.5rem',
            background: showAddForm ? '#6b7280' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add Segment'}
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ marginRight: '0.5rem', fontWeight: '500' }}>Status:</label>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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
            {editingId ? 'Edit Segment' : 'Add New Segment'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                Filters (JSON) *
              </label>
              <textarea
                value={formData.filters}
                onChange={(e) => setFormData({ ...formData, filters: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  minHeight: '120px',
                  fontFamily: 'monospace',
                }}
                required
              />
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Example: {`{"country": "PT", "totalSpent": {"min": 500}}`}
              </p>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.autoUpdate}
                  onChange={(e) => setFormData({ ...formData, autoUpdate: e.target.checked })}
                />
                <span style={{ fontWeight: '500' }}>Auto Update</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Automatically add/remove members based on filters
              </p>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <span style={{ fontWeight: '500' }}>Active</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Enable this segment
              </p>
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
              {editingId ? 'Update Segment' : 'Create Segment'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
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
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading segments...</p>
      ) : filteredSegments.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No segments found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '0.5rem' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Description</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Members</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Auto Update</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSegments.map((segment) => (
                <tr key={segment.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '500' }}>{segment.name}</td>
                  <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                    {segment.description || '-'}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#3b82f6' }}>
                    {segment._count?.members || 0}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {segment.autoUpdate ? (
                      <span style={{ color: '#10b981' }}>✓</span>
                    ) : (
                      <span style={{ color: '#6b7280' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: segment.active ? '#d1fae5' : '#fee2e2',
                        color: segment.active ? '#065f46' : '#991b1b',
                      }}
                    >
                      {segment.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleEdit(segment)}
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
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(segment.id, segment.active)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: segment.active ? '#f59e0b' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        {segment.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(segment.id)}
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
                        Delete
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
