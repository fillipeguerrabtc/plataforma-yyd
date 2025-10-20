'use client';

import { useState } from 'react';
import { assignGuide } from '@/app/bookings/[id]/actions';

export default function AssignGuideForm({ 
  bookingId, 
  currentGuideId, 
  guides 
}: { 
  bookingId: string; 
  currentGuideId: string | null;
  guides: any[];
}) {
  const [selectedGuide, setSelectedGuide] = useState(currentGuideId || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await assignGuide(bookingId, selectedGuide);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label
          style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}
        >
          Selecionar Guia:
        </label>
        <select
          value={selectedGuide}
          onChange={(e) => setSelectedGuide(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--gray-300)',
            borderRadius: '8px',
            fontSize: '0.875rem',
          }}
        >
          <option value="">Nenhum guia</option>
          {guides.map((guide) => (
            <option key={guide.id} value={guide.id}>
              {guide.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: loading ? 'var(--gray-400)' : 'var(--brand-turquoise)',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          fontWeight: '600',
          fontSize: '0.875rem',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Atualizando...' : 'Atribuir Guia'}
      </button>
    </form>
  );
}
