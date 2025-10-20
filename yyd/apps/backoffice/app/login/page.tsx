'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('yyd-user', JSON.stringify(data.user));
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Image 
              src="/logo.png" 
              alt="Yes, You Deserve!" 
              width={80} 
              height={80}
              priority
              style={{ objectFit: 'contain', margin: '0 auto', marginBottom: '1rem' }}
            />
            <h1 className="font-pacifico" style={{ fontSize: '1.5rem', color: 'var(--brand-turquoise)', marginBottom: '0.5rem' }}>
              Yes, You Deserve!
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
              Backoffice Login
            </p>
          </div>

          {error && (
            <div style={{ padding: '0.75rem', background: '#FEE2E2', color: '#991B1B', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading ? 'var(--gray-400)' : 'var(--brand-turquoise)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
            Default: admin@yyd.tours / admin123
          </div>
        </div>
      </div>
    </div>
  );
}
