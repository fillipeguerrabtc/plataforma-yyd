'use client';

import { useEffect, useState } from 'react';

type AuroraConfig = {
  id: string;
  name: string;
  autonomyLevel: string;
  maxBookingValue: number;
  requireHumanApproval: boolean;
  affectiveActivation: number;
  affectiveCordial: number;
  affectiveSincerity: number;
  learningRate: number;
  handoffThreshold: number;
  empathyLevel: number;
  debugMode: boolean;
  active: boolean;
  behaviorSettings: any;
};

export default function AuroraConfigPage() {
  const [config, setConfig] = useState<AuroraConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    autonomyLevel: 'assisted',
    maxBookingValue: 500,
    requireHumanApproval: true,
    affectiveActivation: 0.7,
    affectiveCordial: 0.9,
    affectiveSincerity: 0.85,
    learningRate: 0.3,
    handoffThreshold: 0.5,
    empathyLevel: 7,
    debugMode: false,
    toneOfVoice: 'friendly',
    responseStyle: 'conversational',
    greetingStyle: 'warm',
    languages: ['en', 'pt', 'es'],
    operatingHours: {
      start: '09:00',
      end: '21:00',
      timezone: 'Europe/Lisbon',
    },
    outOfHoursMessage: {
      en: "Thanks for reaching out! We're currently offline but will respond during business hours (9 AM - 9 PM WET).",
      pt: 'Obrigado por entrar em contato! Estamos offline no momento, mas responderemos no horário comercial (9h - 21h WET).',
      es: '¡Gracias por comunicarte! Actualmente estamos fuera de línea, pero responderemos en horario comercial (9h - 21h WET).',
    },
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        autonomyLevel: formData.autonomyLevel,
        maxBookingValue: formData.maxBookingValue,
        requireHumanApproval: formData.requireHumanApproval,
        affectiveActivation: formData.affectiveActivation,
        affectiveCordial: formData.affectiveCordial,
        affectiveSincerity: formData.affectiveSincerity,
        learningRate: formData.learningRate,
        handoffThreshold: formData.handoffThreshold,
        empathyLevel: formData.empathyLevel,
        debugMode: formData.debugMode,
        behaviorSettings: {
          toneOfVoice: formData.toneOfVoice,
          responseStyle: formData.responseStyle,
          greetingStyle: formData.greetingStyle,
          languages: formData.languages,
          operatingHours: formData.operatingHours,
          outOfHoursMessage: formData.outOfHoursMessage,
        },
      };

      alert('Configurações salvas com sucesso! (Em desenvolvimento)');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Falha ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#6b7280' }}>Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>⚙️ Configuração da Aurora IA</h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Configure o comportamento, tom e personalidade da Aurora
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Comportamento e Tom */}
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            💬 Comportamento e Tom
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Tom de Voz</label>
              <select
                value={formData.toneOfVoice}
                onChange={(e) => setFormData({ ...formData, toneOfVoice: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly (Amigável)</option>
                <option value="casual">Casual (Descontraído)</option>
                <option value="enthusiastic">Enthusiastic (Entusiasmado)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Estilo de Resposta</label>
              <select
                value={formData.responseStyle}
                onChange={(e) => setFormData({ ...formData, responseStyle: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="brief">Brief (Breve)</option>
                <option value="conversational">Conversational (Conversacional)</option>
                <option value="detailed">Detailed (Detalhado)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Estilo de Saudação</label>
              <select
                value={formData.greetingStyle}
                onChange={(e) => setFormData({ ...formData, greetingStyle: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="formal">Formal</option>
                <option value="warm">Warm (Caloroso)</option>
                <option value="playful">Playful (Divertido)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Nível de Empatia</label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.empathyLevel}
                onChange={(e) => setFormData({ ...formData, empathyLevel: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
              <div style={{ textAlign: 'center', marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {formData.empathyLevel} / 10
              </div>
            </div>
          </div>
        </div>

        {/* Horários de Operação */}
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            🕐 Horários de Operação
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Início</label>
              <input
                type="time"
                value={formData.operatingHours.start}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    operatingHours: { ...formData.operatingHours, start: e.target.value },
                  })
                }
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Fim</label>
              <input
                type="time"
                value={formData.operatingHours.end}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    operatingHours: { ...formData.operatingHours, end: e.target.value },
                  })
                }
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Mensagens Fora do Horário
            </label>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>🇬🇧 English</label>
                <textarea
                  value={formData.outOfHoursMessage.en}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outOfHoursMessage: { ...formData.outOfHoursMessage, en: e.target.value },
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    minHeight: '60px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>🇵🇹 Português</label>
                <textarea
                  value={formData.outOfHoursMessage.pt}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outOfHoursMessage: { ...formData.outOfHoursMessage, pt: e.target.value },
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    minHeight: '60px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>🇪🇸 Español</label>
                <textarea
                  value={formData.outOfHoursMessage.es}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outOfHoursMessage: { ...formData.outOfHoursMessage, es: e.target.value },
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    minHeight: '60px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Parâmetros Avançados */}
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            🔬 Parâmetros Avançados
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Nível de Autonomia</label>
              <select
                value={formData.autonomyLevel}
                onChange={(e) => setFormData({ ...formData, autonomyLevel: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="supervised">Supervised (Supervisionado)</option>
                <option value="assisted">Assisted (Assistido)</option>
                <option value="autonomous">Autonomous (Autônomo)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                Valor Máximo de Reserva (€)
              </label>
              <input
                type="number"
                step="10"
                value={formData.maxBookingValue}
                onChange={(e) => setFormData({ ...formData, maxBookingValue: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.requireHumanApproval}
                  onChange={(e) => setFormData({ ...formData, requireHumanApproval: e.target.checked })}
                />
                <span style={{ fontWeight: '500' }}>Requer Aprovação Humana</span>
              </label>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.debugMode}
                  onChange={(e) => setFormData({ ...formData, debugMode: e.target.checked })}
                />
                <span style={{ fontWeight: '500' }}>Modo Debug</span>
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.75rem 2rem',
              background: saving ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
            }}
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}
