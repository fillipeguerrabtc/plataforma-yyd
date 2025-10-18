'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchWithAuth } from '@/lib/backoffice-auth';

interface SiteConfig {
  id: string;
  key: string;
  value_text: string | null;
  category: string;
  description: string | null;
}

export default function ConfigPage() {
  const [configs, setConfigs] = useState<SiteConfig[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<SiteConfig[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingConfig, setEditingConfig] = useState<SiteConfig | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadConfigs();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredConfigs(configs);
    } else {
      setFilteredConfigs(configs.filter(c => c.category === selectedCategory));
    }
  }, [selectedCategory, configs]);

  const loadConfigs = async () => {
    try {
      const res = await fetchWithAuth('/api/v1/backoffice/config');
      const data = await res.json();
      setConfigs(data);
      setFilteredConfigs(data);
    } catch (error) {
      console.error('Failed to load configs:', error);
    }
  };

  const handleEdit = (config: SiteConfig) => {
    setEditingConfig(config);
    setEditValue(config.value_text || '');
  };

  const handleSave = async () => {
    if (!editingConfig) return;

    try {
      const res = await fetchWithAuth(`/api/v1/backoffice/config/${editingConfig.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value_text: editValue })
      });

      if (res.ok) {
        await loadConfigs();
        setEditingConfig(null);
        alert('Configuration updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      alert('Failed to update configuration');
    }
  };

  const categories = ['all', ...new Set(configs.map(c => c.category))];

  return (
    <DashboardLayout>
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1A1A1A' }}>
          Site Configuration
        </h1>
        <p style={{ color: '#6B7280', marginBottom: '32px' }}>
          Edit all website content, texts, images, and videos from the official YYD site.
        </p>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Filter by Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  KEY
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  CATEGORY
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  VALUE
                </th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredConfigs.map((config) => (
                <tr key={config.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                    {config.key}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <span style={{
                      background: '#5FBCBC20',
                      color: '#5FBCBC',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {config.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                    {config.value_text?.substring(0, 60)}
                    {config.value_text && config.value_text.length > 60 ? '...' : ''}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleEdit(config)}
                      style={{
                        padding: '6px 12px',
                        background: '#5FBCBC',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingConfig && (
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
              padding: '32px',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                Edit Configuration
              </h2>
              <div style={{ marginBottom: '16px' }}>
                <strong>Key:</strong> {editingConfig.key}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Value:
                </label>
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setEditingConfig(null)}
                  style={{
                    padding: '10px 20px',
                    background: '#6B7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '10px 20px',
                    background: '#5FBCBC',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
