'use client';

import { useState } from 'react';

interface Integration {
  id: string;
  kind: string;
  name: string;
  config: any;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function IntegrationManager({ initialIntegrations }: { initialIntegrations: Integration[] }) {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    kind: '',
    name: '',
    config: '{}',
    active: true,
  });

  const integrationKinds = [
    { value: 'stripe', label: 'Stripe Payments', icon: '💳', color: 'var(--brand-turquoise)' },
    { value: 'whatsapp', label: 'WhatsApp Cloud API', icon: '💬', color: '#25D366' },
    { value: 'facebook', label: 'Facebook Messenger', icon: '📱', color: '#0084FF' },
    { value: 'email', label: 'Email (SMTP)', icon: '📧', color: '#EA4335' },
    { value: 'openai', label: 'OpenAI', icon: '🤖', color: '#10a37f' },
  ];

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ kind: '', name: '', config: '{}', active: true });
  };

  const handleEdit = (integration: Integration) => {
    setEditingId(integration.id);
    setIsAdding(false);
    setFormData({
      kind: integration.kind,
      name: integration.name,
      config: JSON.stringify(integration.config, null, 2),
      active: integration.active,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ kind: '', name: '', config: '{}', active: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let config = {};
      try {
        config = JSON.parse(formData.config);
      } catch {
        alert('Configuração JSON inválida');
        return;
      }

      const payload = {
        kind: formData.kind,
        name: formData.name,
        config,
        active: formData.active,
      };

      if (editingId) {
        const response = await fetch(`/api/integrations/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to update integration');

        const updated = await response.json();
        setIntegrations(integrations.map((i) => (i.id === editingId ? updated : i)));
      } else {
        const response = await fetch('/api/integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to create integration');

        const created = await response.json();
        setIntegrations([created, ...integrations]);
      }

      handleCancel();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta integração?')) return;

    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete integration');

      setIntegrations(integrations.filter((i) => i.id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(null);

    try {
      const response = await fetch(`/api/integrations/${id}/test`, {
        method: 'POST',
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message,
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!response.ok) throw new Error('Failed to toggle integration');

      const updated = await response.json();
      setIntegrations(integrations.map((i) => (i.id === id ? updated : i)));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getKindConfig = (kind: string) => integrationKinds.find((k) => k.value === kind);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
            🔗 Integrações
          </h1>
          <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            Gerencie as integrações de pagamento, mensagens e IA
          </p>
        </div>
        <button
          onClick={handleAdd}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--brand-turquoise)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ➕ Adicionar Integração
        </button>
      </div>

      {(isAdding || editingId) && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
            {editingId ? 'Editar Integração' : 'Nova Integração'}
          </h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Tipo</label>
              <select
                value={formData.kind}
                onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                required
                disabled={!!editingId}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '6px',
                }}
              >
                <option value="">Selecione...</option>
                {integrationKinds.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.icon} {k.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '6px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Configuração (JSON)</label>
              <textarea
                value={formData.config}
                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                id="active-checkbox"
              />
              <label htmlFor="active-checkbox">Ativo</label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--brand-turquoise)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {editingId ? 'Salvar' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--gray-200)',
                color: 'var(--brand-black)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {testResult && (
        <div
          style={{
            background: testResult.success ? '#d4edda' : '#f8d7da',
            color: testResult.success ? '#155724' : '#721c24',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
          }}
        >
          <strong>{testResult.success ? '✅ Sucesso' : '❌ Erro'}:</strong> {testResult.message}
          {testResult.details && (
            <pre style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {JSON.stringify(testResult.details, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {integrations.map((integration) => {
          const kindConfig = getKindConfig(integration.kind);
          return (
            <div
              key={integration.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: integration.active ? `2px solid ${kindConfig?.color || 'var(--gray-300)'}` : '2px solid var(--gray-200)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    background: `${kindConfig?.color || '#ccc'}15`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    flexShrink: 0,
                  }}
                >
                  {kindConfig?.icon || '🔌'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
                      {integration.name}
                    </h3>
                    <button
                      onClick={() => handleToggleActive(integration.id, integration.active)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: integration.active ? `${kindConfig?.color}15` : 'var(--gray-200)',
                        color: integration.active ? kindConfig?.color : 'var(--gray-700)',
                        border: 'none',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      {integration.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>

                  <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {kindConfig?.label || integration.kind}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleTest(integration.id)}
                      disabled={testingId === integration.id}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--brand-turquoise)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        opacity: testingId === integration.id ? 0.5 : 1,
                      }}
                    >
                      {testingId === integration.id ? '⏳ Testando...' : '🔍 Testar Conexão'}
                    </button>
                    <button
                      onClick={() => handleEdit(integration)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--gray-100)',
                        color: 'var(--brand-black)',
                        border: '1px solid var(--gray-300)',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(integration.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#fee',
                        color: '#c33',
                        border: '1px solid #fcc',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️ Remover
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {integrations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
            Nenhuma integração configurada. Clique em "Adicionar Integração" para começar.
          </div>
        )}
      </div>
    </div>
  );
}
