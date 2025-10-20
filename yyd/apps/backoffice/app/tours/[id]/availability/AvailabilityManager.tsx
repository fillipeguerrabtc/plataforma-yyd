'use client';

import { useState } from 'react';

interface AvailabilitySlot {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  maxSlots: number;
  status: string;
}

export default function AvailabilityManager({
  tourId,
  initialSlots,
}: {
  tourId: string;
  initialSlots: any[];
}) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(
    initialSlots.map((s) => ({
      ...s,
      date: s.date.split('T')[0],
    }))
  );
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '09:00',
    endTime: '13:00',
    maxSlots: 1,
    status: 'available',
  });

  const handleAdd = () => {
    setSlots([...slots, { ...newSlot }]);
    setNewSlot({
      date: '',
      startTime: '09:00',
      endTime: '13:00',
      maxSlots: 1,
      status: 'available',
    });
  };

  const handleRemove = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleBlockDate = () => {
    if (!newSlot.date) {
      alert('Selecione uma data');
      return;
    }
    setSlots([
      ...slots,
      {
        date: newSlot.date,
        startTime: '00:00',
        endTime: '23:59',
        maxSlots: 0,
        status: 'blocked',
      },
    ]);
    setNewSlot({ ...newSlot, date: '' });
  };

  return (
    <div>
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>➕ Adicionar Horário Disponível</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <input
              type="date"
              value={newSlot.date}
              onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input
                type="time"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="time"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
            <input
              type="number"
              placeholder="Vagas máximas"
              value={newSlot.maxSlots}
              onChange={(e) => setNewSlot({ ...newSlot, maxSlots: parseInt(e.target.value) })}
              min="1"
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <button
              onClick={handleAdd}
              style={{
                padding: '0.75rem',
                background: 'var(--brand-turquoise)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Adicionar Horário
            </button>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>🚫 Bloquear Data (Blackout)</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <input
              type="date"
              value={newSlot.date}
              onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <button
              onClick={handleBlockDate}
              style={{
                padding: '0.75rem',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Bloquear Data
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px' }}>
        <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>📋 Horários e Datas Bloqueadas</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {slots
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((slot, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: slot.status === 'blocked' ? '#ffebee' : '#e8f5e9',
                  borderRadius: '8px',
                  border: slot.status === 'blocked' ? '1px solid #f44336' : '1px solid #4CAF50',
                }}
              >
                <div>
                  <strong>{new Date(slot.date).toLocaleDateString('pt-PT')}</strong>
                  {slot.status !== 'blocked' && (
                    <span style={{ marginLeft: '1rem', color: '#666' }}>
                      {slot.startTime} - {slot.endTime} ({slot.maxSlots} vagas)
                    </span>
                  )}
                  {slot.status === 'blocked' && (
                    <span style={{ marginLeft: '1rem', color: '#f44336', fontWeight: 'bold' }}>
                      🚫 BLOQUEADO
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Remover
                </button>
              </div>
            ))}
        </div>

        {slots.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            Nenhum horário ou bloqueio configurado
          </div>
        )}
      </div>
    </div>
  );
}
