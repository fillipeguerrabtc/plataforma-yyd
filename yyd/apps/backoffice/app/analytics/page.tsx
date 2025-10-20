'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#37C8C4', '#E9C46A', '#7E3231', '#2A9D8F', '#F4A261'];

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/revenue');
      const data = await res.json();
      setRevenueData(data);
    } catch (error) {
      console.error('Analytics load error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
        Carregando analytics...
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          📊 Business Intelligence
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          Análises avançadas de receita, bookings e performance
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard
          title="Receita Total"
          value={`€${revenueData.totals?.total?.toFixed(2) || 0}`}
          color="var(--brand-turquoise)"
          icon="💰"
        />
        <StatCard
          title="Média por Reserva"
          value={`€${revenueData.totals?.average?.toFixed(2) || 0}`}
          color="var(--brand-gold)"
          icon="📊"
        />
        <StatCard
          title="Total de Bookings"
          value={revenueData.totals?.count || 0}
          color="var(--brand-bordeaux)"
          icon="🎫"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            📈 Receita Diária (Últimos 30 Dias)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData.daily || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '0.75rem' }} />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#37C8C4"
                strokeWidth={2}
                name="Receita (€)"
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#E9C46A"
                strokeWidth={2}
                name="Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🗺️ Receita por Tour
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueData.byProduct || []}
                dataKey="revenue"
                nameKey="productName"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `€${entry.revenue.toFixed(0)}`}
              >
                {(revenueData.byProduct || []).map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          📊 Performance por Tour
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData.byProduct || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="productName"
              stroke="#6b7280"
              style={{ fontSize: '0.75rem' }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: '0.75rem' }} />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#37C8C4" name="Receita (€)" />
            <Bar dataKey="count" fill="#E9C46A" name="Bookings" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: string | number;
  color: string;
  icon: string;
}) {
  return (
    <div
      style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
            {title}
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color }}>
            {value}
          </p>
        </div>
        <div
          style={{
            width: '48px',
            height: '48px',
            background: `${color}15`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
