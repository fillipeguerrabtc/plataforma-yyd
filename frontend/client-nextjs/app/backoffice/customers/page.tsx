'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchWithAuth } from '@/lib/backoffice-auth';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  language: string;
  segment: string;
  tags: string[];
  lifetime_value_eur: number;
  total_bookings: number;
  created_at: string;
  updated_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCustomers();
  }, [filter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/v1/backoffice/customers?limit=100'
        : `/api/v1/backoffice/customers?segment=${filter}&limit=100`;
      
      const res = await fetchWithAuth(url);
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const segmentColors: Record<string, string> = {
    vip: '#FFD700',
    regular: '#00B5CC',
    prospect: '#33C5DD',
    inactive: '#5C5C5C',
  };

  const filters = [
    { value: 'all', label: 'All Customers', icon: '👥' },
    { value: 'vip', label: 'VIP', icon: '⭐' },
    { value: 'regular', label: 'Regular', icon: '👤' },
    { value: 'prospect', label: 'Prospects', icon: '🎯' },
    { value: 'inactive', label: 'Inactive', icon: '💤' },
  ];

  return (
    <DashboardLayout>
      <div>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          marginBottom: '8px', 
          color: '#222222',
          fontFamily: "'Poppins', sans-serif" 
        }}>
          Customers (CRM)
        </h1>
        <p style={{ 
          color: '#5C5C5C', 
          marginBottom: '32px',
          fontFamily: "'Open Sans', sans-serif" 
        }}>
          Manage your customer relationships and segmentation.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: filter === f.value ? '2px solid #00B5CC' : '1px solid #E4E4E4',
                background: filter === f.value ? 'rgba(0,181,204,0.1)' : 'white',
                color: filter === f.value ? '#00B5CC' : '#5C5C5C',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: filter === f.value ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                if (filter !== f.value) {
                  e.currentTarget.style.borderColor = '#00B5CC';
                  e.currentTarget.style.background = 'rgba(0,181,204,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== f.value) {
                  e.currentTarget.style.borderColor = '#E4E4E4';
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              <span style={{ marginRight: '8px' }}>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#5C5C5C' }}>
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '60px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <h3 style={{ 
              fontSize: '20px', 
              marginBottom: '8px',
              fontFamily: "'Poppins', sans-serif",
              color: '#222222'
            }}>
              No customers yet
            </h3>
            <p style={{ 
              color: '#5C5C5C',
              fontFamily: "'Open Sans', sans-serif" 
            }}>
              Customers will appear here as they make bookings or submit leads.
            </p>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #00B5CC 0%, #33C5DD 100%)' }}>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    color: 'white',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Customer
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'left', 
                    color: 'white',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Contact
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    color: 'white',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Segment
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'right', 
                    color: 'white',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    LTV
                  </th>
                  <th style={{ 
                    padding: '16px', 
                    textAlign: 'center', 
                    color: 'white',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Bookings
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    style={{
                      borderBottom: index < customers.length - 1 ? '1px solid #E4E4E4' : 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#FAFAFA';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#222222',
                        fontFamily: "'Poppins', sans-serif",
                        marginBottom: '4px'
                      }}>
                        {customer.name}
                      </div>
                      {customer.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {customer.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                background: 'rgba(0,181,204,0.1)',
                                color: '#00B5CC',
                                borderRadius: '8px',
                                fontFamily: "'Open Sans', sans-serif"
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#5C5C5C',
                        fontFamily: "'Open Sans', sans-serif",
                        marginBottom: '2px'
                      }}>
                        {customer.email}
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#9CA3AF',
                        fontFamily: "'Open Sans', sans-serif"
                      }}>
                        {customer.phone || 'No phone'}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        fontFamily: "'Poppins', sans-serif",
                        background: `${segmentColors[customer.segment]}20`,
                        color: segmentColors[customer.segment]
                      }}>
                        {customer.segment.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'right',
                      fontWeight: '600',
                      color: '#222222',
                      fontFamily: "'Poppins', sans-serif"
                    }}>
                      €{customer.lifetime_value_eur.toFixed(2)}
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#00B5CC',
                      fontFamily: "'Poppins', sans-serif"
                    }}>
                      {customer.total_bookings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
