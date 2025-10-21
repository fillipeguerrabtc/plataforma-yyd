'use client';

import { useEffect, useState } from 'react';

type Automation = {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  conditions?: Record<string, any>;
  actions: Record<string, any>[];
  active: boolean;
  runCount: number;
  createdAt: string;
};

const TRIGGER_OPTIONS = [
  { value: 'booking_confirmed', label: 'Booking Confirmed' },
  { value: 'tour_completed', label: 'Tour Completed' },
  { value: 'customer_birthday', label: 'Customer Birthday' },
  { value: 'inactive_6months', label: 'Inactive 6 Months' },
  { value: 'booking_reminder', label: 'Booking Reminder' },
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'booking_confirmed',
    conditions: '{}',
    actions: '[]',
    active: true,
  });

  useEffect(() => {
    fetchAutomations();
  }, [activeFilter]);

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.append('active', activeFilter);

      const res = await fetch(`/api/crm/automations?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAutomations(data);
      }
    } catch (error) {
      console.error('Failed to fetch automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (automation: Automation) => {
    setEditingId(automation.id);
    setShowAddForm(true);
    setFormData({
      name: automation.name,
      description: automation.description || '',
      trigger: automation.trigger,
      conditions: JSON.stringify(automation.conditions || {}, null, 2),
      actions: JSON.stringify(automation.actions, null, 2),
      active: automation.active,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const conditions = JSON.parse(formData.conditions);
      const actions = JSON.parse(formData.actions);
      
      const payload = {
        ...formData,
        conditions,
        actions,
      };

      const url = editingId ? `/api/crm/automations/${editingId}` : '/api/crm/automations';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddForm(false);
        resetForm();
        fetchAutomations();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to save automation'}`);
      }
    } catch (error) {
      console.error('Failed to save automation:', error);
      alert('Failed to save automation. Check JSON syntax.');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/crm/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (res.ok) {
        fetchAutomations();
      }
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;

    try {
      const res = await fetch(`/api/crm/automations/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchAutomations();
      }
    } catch (error) {
      console.error('Failed to delete automation:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger: 'booking_confirmed',
      conditions: '{}',
      actions: '[]',
      active: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const filteredAutomations = automations.filter((auto) => {
    if (activeFilter === 'true') return auto.active;
    if (activeFilter === 'false') return !auto.active;
    return true;
  });

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>CRM Automations</h1>
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
          {showAddForm ? 'Cancel' : '+ Add Automation'}
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
          <option value="true">Active</option>
          <option value="false">Inactive</option>
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
            {editingId ? 'Edit Automation' : 'Add New Automation'}
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
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Trigger *</label>
              <select
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              >
                {TRIGGER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
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
                Conditions (JSON)
              </label>
              <textarea
                value={formData.conditions}
                onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  minHeight: '80px',
                  fontFamily: 'monospace',
                }}
              />
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Example: {`{"totalSpent": {"min": 100}}`}
              </p>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                Actions (JSON) *
              </label>
              <textarea
                value={formData.actions}
                onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
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
                Example: {`[{"type": "send_email", "template": "tour_completed_review"}]`}
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
                Enable this automation
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
              {editingId ? 'Update Automation' : 'Create Automation'}
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
        <p>Loading automations...</p>
      ) : filteredAutomations.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No automations found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '0.5rem' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Trigger</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Run Count</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAutomations.map((automation) => (
                <tr key={automation.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                    <div>{automation.name}</div>
                    {automation.description && (
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        {automation.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: '#dbeafe',
                        color: '#1e40af',
                      }}
                    >
                      {TRIGGER_OPTIONS.find((t) => t.value === automation.trigger)?.label || automation.trigger}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#3b82f6' }}>
                    {automation.runCount}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: automation.active ? '#d1fae5' : '#fee2e2',
                        color: automation.active ? '#065f46' : '#991b1b',
                      }}
                    >
                      {automation.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleEdit(automation)}
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
                        onClick={() => handleToggleActive(automation.id, automation.active)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: automation.active ? '#f59e0b' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        {automation.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(automation.id)}
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
