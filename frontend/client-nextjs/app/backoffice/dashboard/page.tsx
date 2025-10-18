'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchWithAuth } from '@/lib/backoffice-auth';

interface Stats {
  totalBookings: number;
  totalRevenue: number;
  totalLeads: number;
  activeUsers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalRevenue: 0,
    totalLeads: 0,
    activeUsers: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [bookingsRes, leadsRes] = await Promise.all([
        fetchWithAuth('/api/v1/bookings'),
        fetchWithAuth('/api/v1/leads')
      ]);

      const bookings = await bookingsRes.json();
      const leads = await leadsRes.json();

      const totalRevenue = bookings.reduce((sum: number, b: any) => 
        sum + parseFloat(b.total_price_eur || 0), 0
      );

      setStats({
        totalBookings: bookings.length,
        totalRevenue,
        totalLeads: leads.length,
        activeUsers: 1
      });

      setRecentBookings(bookings.slice(0, 5));
      setRecentLeads(leads.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const statCards = [
    { label: 'Total Bookings', value: stats.totalBookings, icon: '📅', color: '#5FBCBC' },
    { label: 'Total Revenue', value: `€${stats.totalRevenue.toFixed(2)}`, icon: '💰', color: '#E9C46A' },
    { label: 'Total Leads', value: stats.totalLeads, icon: '📝', color: '#10B981' },
    { label: 'Active Users', value: stats.activeUsers, icon: '👥', color: '#8B5CF6' },
  ];

  return (
    <DashboardLayout>
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1A1A1A' }}>
          Dashboard
        </h1>
        <p style={{ color: '#6B7280', marginBottom: '32px' }}>
          Welcome to YYD BackOffice. Here's an overview of your platform.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {statCards.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: `2px solid ${stat.color}15`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px', marginRight: '12px' }}>{stat.icon}</span>
                <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
                  {stat.label}
                </span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1A1A1A' }}>
              Recent Bookings
            </h2>
            {recentBookings.length === 0 ? (
              <p style={{ color: '#9CA3AF' }}>No bookings yet</p>
            ) : (
              <div>
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid #E5E7EB',
                      fontSize: '14px'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#1A1A1A' }}>
                      {booking.customer_name}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '12px' }}>
                      €{booking.total_price_eur} • {new Date(booking.booking_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1A1A1A' }}>
              Recent Leads
            </h2>
            {recentLeads.length === 0 ? (
              <p style={{ color: '#9CA3AF' }}>No leads yet</p>
            ) : (
              <div>
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid #E5E7EB',
                      fontSize: '14px'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#1A1A1A' }}>
                      {lead.name}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '12px' }}>
                      {lead.email} • {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
