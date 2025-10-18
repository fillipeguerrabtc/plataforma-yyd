'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchWithAuth } from '@/lib/backoffice-auth';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  created_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const res = await fetchWithAuth('/api/v1/leads');
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error('Failed to load leads:', error);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1A1A1A' }}>
              Leads Management
            </h1>
            <p style={{ color: '#6B7280' }}>
              View all lead submissions from the website contact form.
            </p>
          </div>
          <button style={{
            padding: '12px 24px',
            background: '#5FBCBC',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Export to CSV
          </button>
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
                  NAME
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  EMAIL
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  PHONE
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  SOURCE
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  SUBMITTED
                </th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                    No leads yet
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                      {lead.name}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                      {lead.email}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                      {lead.phone || '—'}
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
                        {lead.source || 'Direct'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => window.open(`mailto:${lead.email}`)}
                        style={{
                          padding: '6px 12px',
                          background: '#5FBCBC',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Contact
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
