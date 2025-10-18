'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchWithAuth } from '@/lib/backoffice-auth';

interface Tour {
  id: string;
  slug: string;
  title_en: string;
  base_price_eur: number;
  duration_minutes: number;
  category: string;
  visibility: boolean;
  featured: boolean;
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      const res = await fetch('/api/v1/tours');
      const data = await res.json();
      setTours(data);
    } catch (error) {
      console.error('Failed to load tours:', error);
    }
  };

  const toggleVisibility = async (tourId: string, currentVisibility: boolean) => {
    if (confirm(`${currentVisibility ? 'Hide' : 'Show'} this tour?`)) {
      console.log('Toggle visibility for tour:', tourId);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1A1A1A' }}>
              Tours Management
            </h1>
            <p style={{ color: '#6B7280' }}>
              Manage your tour packages and pricing.
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
            + Create New Tour
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
                  TOUR NAME
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  CATEGORY
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  DURATION
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  PRICE
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  STATUS
                </th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                    {tour.title_en}
                    {tour.featured && (
                      <span style={{
                        marginLeft: '8px',
                        background: '#E9C46A',
                        color: '#1A1A1A',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        FEATURED
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                    {tour.category}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                    {tour.duration_minutes} min
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#5FBCBC' }}>
                    €{tour.base_price_eur}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <span style={{
                      background: tour.visibility ? '#10B98120' : '#EF444420',
                      color: tour.visibility ? '#10B981' : '#EF4444',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {tour.visibility ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => toggleVisibility(tour.id, tour.visibility)}
                      style={{
                        padding: '6px 12px',
                        background: '#6B7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        marginRight: '8px'
                      }}
                    >
                      {tour.visibility ? 'Hide' : 'Show'}
                    </button>
                    <button
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
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
