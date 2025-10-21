'use client';

import { useState } from 'react';

interface AuroraConfig {
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
}

interface Knowledge {
  id: string;
  category: string;
  questionEn: string;
  questionPt: string;
  questionEs: string;
  answerEn: string;
  answerPt: string;
  answerEs: string;
  tags: string[];
  priority: number;
  active: boolean;
  usageCount: number;
}

export default function AuroraConfigManager({
  initialConfig,
  initialKnowledge,
}: {
  initialConfig: AuroraConfig | null;
  initialKnowledge: Knowledge[];
}) {
  const [config, setConfig] = useState(initialConfig);
  const [knowledge, setKnowledge] = useState(initialKnowledge);
  const [activeTab, setActiveTab] = useState<'config' | 'knowledge'>('config');
  const [showKnowledgeForm, setShowKnowledgeForm] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<string | null>(null);

  const [knowledgeForm, setKnowledgeForm] = useState({
    category: '',
    questionEn: '',
    questionPt: '',
    questionEs: '',
    answerEn: '',
    answerPt: '',
    answerEs: '',
    tags: '',
    priority: 0,
  });

  const handleConfigUpdate = async (field: string, value: any) => {
    if (!config) return;

    try {
      const res = await fetch(`/api/aurora/config/${config.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) throw new Error('Failed to update config');

      const updated = await res.json();
      setConfig(updated);
    } catch (error) {
      alert('Erro ao atualizar configuração');
    }
  };

  const handleKnowledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...knowledgeForm,
        tags: knowledgeForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const res = editingKnowledge
        ? await fetch(`/api/aurora/knowledge/${editingKnowledge}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/aurora/knowledge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (!res.ok) throw new Error('Failed to save knowledge');

      const saved = await res.json();

      if (editingKnowledge) {
        setKnowledge(knowledge.map((k) => (k.id === editingKnowledge ? saved : k)));
      } else {
        setKnowledge([saved, ...knowledge]);
      }

      setShowKnowledgeForm(false);
      setEditingKnowledge(null);
      setKnowledgeForm({
        category: '',
        questionEn: '',
        questionPt: '',
        questionEs: '',
        answerEn: '',
        answerPt: '',
        answerEs: '',
        tags: '',
        priority: 0,
      });
    } catch (error) {
      alert('Erro ao salvar conhecimento');
    }
  };

  const handleKnowledgeDelete = async (id: string) => {
    if (!confirm('Remover este conhecimento?')) return;

    try {
      const res = await fetch(`/api/aurora/knowledge/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setKnowledge(knowledge.filter((k) => k.id !== id));
    } catch (error) {
      alert('Erro ao remover conhecimento');
    }
  };

  const handleKnowledgeEdit = (k: Knowledge) => {
    setEditingKnowledge(k.id);
    setKnowledgeForm({
      category: k.category,
      questionEn: k.questionEn,
      questionPt: k.questionPt,
      questionEs: k.questionEs,
      answerEn: k.answerEn,
      answerPt: k.answerPt,
      answerEs: k.answerEs,
      tags: k.tags.join(', '),
      priority: k.priority,
    });
    setShowKnowledgeForm(true);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
        🤖 Aurora IA - Configuração
      </h1>
      <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
        Gerencie comportamento, parâmetros afetivos e base de conhecimento
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('config')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'config' ? 'var(--brand-turquoise)' : 'var(--gray-100)',
            color: activeTab === 'config' ? 'white' : 'var(--gray-700)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ⚙️ Configuração
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'knowledge' ? 'var(--brand-turquoise)' : 'var(--gray-100)',
            color: activeTab === 'knowledge' ? 'white' : 'var(--gray-700)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          📚 Base de Conhecimento ({knowledge.length})
        </button>
      </div>

      {activeTab === 'config' && config && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Comportamento & Autonomia
              </h2>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Nível de Autonomia
                </label>
                <select
                  value={config.autonomyLevel}
                  onChange={(e) => handleConfigUpdate('autonomyLevel', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="manual">Manual (apenas sugestões)</option>
                  <option value="assisted">Assistido (aprovar reservas)</option>
                  <option value="autonomous">Autônomo (total)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Valor Máximo de Reserva (€)
                </label>
                <input
                  type="number"
                  value={config.maxBookingValue}
                  onChange={(e) => handleConfigUpdate('maxBookingValue', parseFloat(e.target.value))}
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.requireHumanApproval}
                    onChange={(e) => handleConfigUpdate('requireHumanApproval', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Exigir Aprovação Humana</span>
                </label>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.debugMode}
                    onChange={(e) => handleConfigUpdate('debugMode', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Modo Debug</span>
                </label>
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Parâmetros Afetivos (VAD)
              </h2>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Ativação (Affective Activation): {config.affectiveActivation}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.affectiveActivation}
                  onChange={(e) => handleConfigUpdate('affectiveActivation', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Cordialidade (Affective Cordial): {config.affectiveCordial}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.affectiveCordial}
                  onChange={(e) => handleConfigUpdate('affectiveCordial', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Sinceridade (Affective Sincerity): {config.affectiveSincerity}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.affectiveSincerity}
                  onChange={(e) => handleConfigUpdate('affectiveSincerity', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Taxa de Aprendizado: {config.learningRate}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.learningRate}
                  onChange={(e) => handleConfigUpdate('learningRate', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Threshold de Handoff: {config.handoffThreshold}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.handoffThreshold}
                  onChange={(e) => handleConfigUpdate('handoffThreshold', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Nível de Empatia (1-10): {config.empathyLevel}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={config.empathyLevel}
                  onChange={(e) => handleConfigUpdate('empathyLevel', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: 'var(--gray-600)' }}>
              {knowledge.filter((k) => k.active).length} itens ativos
            </p>
            <button
              onClick={() => {
                setShowKnowledgeForm(true);
                setEditingKnowledge(null);
                setKnowledgeForm({
                  category: '',
                  questionEn: '',
                  questionPt: '',
                  questionEs: '',
                  answerEn: '',
                  answerPt: '',
                  answerEs: '',
                  tags: '',
                  priority: 0,
                });
              }}
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
              ➕ Novo Conhecimento
            </button>
          </div>

          {showKnowledgeForm && (
            <form
              onSubmit={handleKnowledgeSubmit}
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid var(--gray-200)',
                marginBottom: '2rem',
              }}
            >
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                {editingKnowledge ? 'Editar' : 'Novo'} Conhecimento
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={knowledgeForm.category}
                    onChange={(e) => setKnowledgeForm({ ...knowledgeForm, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={knowledgeForm.tags}
                    onChange={(e) => setKnowledgeForm({ ...knowledgeForm, tags: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--gray-300)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Pergunta (EN)
                </label>
                <input
                  type="text"
                  value={knowledgeForm.questionEn}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, questionEn: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Resposta (EN)
                </label>
                <textarea
                  value={knowledgeForm.answerEn}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, answerEn: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    minHeight: '80px',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Pergunta (PT)
                </label>
                <input
                  type="text"
                  value={knowledgeForm.questionPt}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, questionPt: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Resposta (PT)
                </label>
                <textarea
                  value={knowledgeForm.answerPt}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, answerPt: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    minHeight: '80px',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Pergunta (ES)
                </label>
                <input
                  type="text"
                  value={knowledgeForm.questionEs}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, questionEs: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Resposta (ES)
                </label>
                <textarea
                  value={knowledgeForm.answerEs}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, answerEs: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    minHeight: '80px',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Prioridade (0-100)
                </label>
                <input
                  type="number"
                  value={knowledgeForm.priority}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, priority: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                  min="0"
                  max="100"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowKnowledgeForm(false);
                    setEditingKnowledge(null);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--gray-100)',
                    color: 'var(--gray-700)',
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {knowledge.map((k) => (
              <div
                key={k.id}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--gray-200)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: 'var(--brand-turquoise)',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}
                    >
                      {k.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      Priority: {k.priority} | Uso: {k.usageCount}x
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleKnowledgeEdit(k)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--gray-100)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleKnowledgeDelete(k.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                      🇬🇧 English
                    </p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {k.questionEn}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      {k.answerEn.substring(0, 100)}
                      {k.answerEn.length > 100 ? '...' : ''}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                      🇵🇹 Português
                    </p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {k.questionPt}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      {k.answerPt.substring(0, 100)}
                      {k.answerPt.length > 100 ? '...' : ''}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                      🇪🇸 Español
                    </p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {k.questionEs}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      {k.answerEs.substring(0, 100)}
                      {k.answerEs.length > 100 ? '...' : ''}
                    </p>
                  </div>
                </div>

                {k.tags.length > 0 && (
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {k.tags.map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: 'var(--gray-100)',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          color: 'var(--gray-700)',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
