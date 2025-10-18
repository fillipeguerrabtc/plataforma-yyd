'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchWithAuth } from '@/lib/backoffice-auth';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetchWithAuth('/api/v1/backoffice/auth/me');
      const currentUser = await res.json();
      setUsers([currentUser]);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      admin: { bg: '#8B5CF620', text: '#8B5CF6' },
      manager: { bg: '#5FBCBC20', text: '#5FBCBC' },
      guide: { bg: '#E9C46A20', text: '#B8860B' },
      staff: { bg: '#6B728020', text: '#6B7280' }
    };
    const color = colors[role] || colors.staff;
    return (
      <span style={{
        background: color.bg,
        color: color.text,
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        textTransform: 'uppercase'
      }}>
        {role}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1A1A1A' }}>
              Users Management
            </h1>
            <p style={{ color: '#6B7280' }}>
              Manage users with role-based access control (RBAC).
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
            + Add New User
          </button>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Role Permissions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '8px' }}>
              <div style={{ fontWeight: '600', color: '#8B5CF6', marginBottom: '4px' }}>Admin</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Full access to all features</div>
            </div>
            <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '8px' }}>
              <div style={{ fontWeight: '600', color: '#5FBCBC', marginBottom: '4px' }}>Manager</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Bookings, tours, and leads</div>
            </div>
            <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '8px' }}>
              <div style={{ fontWeight: '600', color: '#B8860B', marginBottom: '4px' }}>Guide</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>View bookings and tours</div>
            </div>
            <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '8px' }}>
              <div style={{ fontWeight: '600', color: '#6B7280', marginBottom: '4px' }}>Staff</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Limited access</div>
            </div>
          </div>
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
                  ROLE
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
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                    {user.full_name}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6B7280' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {getRoleBadge(user.role)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <span style={{
                      background: user.is_active ? '#10B98120' : '#EF444420',
                      color: user.is_active ? '#10B981' : '#EF4444',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
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
