'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchWithAuth } from '@/lib/backoffice-auth';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  booking_date: string;
  status: string;
  total_price_eur: number;
  payment_status: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await fetchWithAuth('/api/v1/bookings');
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: '#10B98120', text: '#10B981' };
      case 'pending': return { bg: '#E9C46A20', text: '#E9C46A' };
      case 'cancelled': return { bg: '#EF444420', text: '#EF4444' };
      default: return { bg: '#6B728020', text: '#6B7280' };
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1A1A1A' }}>
              Bookings Management
            </h1>
            <p style={{ color: '#6B7280' }}>
              View and manage all tour bookings.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Filter by Status:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
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
                  CUSTOMER
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  EMAIL
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  DATE
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                  AMOUNT
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
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const statusColors = getStatusColor(booking.status);
                  return (
                    <tr key={booking.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                        {booking.customer_name}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                        {booking.customer_email}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#5FBCBC' }}>
                        €{booking.total_price_eur}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        <span style={{
                          background: statusColors.bg,
                          color: statusColors.text,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
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
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
