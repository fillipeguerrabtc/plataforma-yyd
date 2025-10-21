'use client';

import { useEffect, useState } from 'react';

type KnowledgeEntry = {
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
  lastUsedAt: string | null;
  createdAt: string;
};

export default function AuroraKnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState({
    category: '',
    questionEn: '',
    questionPt: '',
    questionEs: '',
    answerEn: '',
    answerPt: '',
    answerEs: '',
    tags: '',
    priority: 0,
    active: true,
  });

  const categories = [
    'Tours',
    'Pricing',
    'Booking',
    'Locations',
    'Policies',
    'Features',
    'General',
    'Transportation',
    'Safety',
    'Contact',
  ];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/aurora/knowledge');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Failed to fetch knowledge entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      const url = editingId ? `/api/aurora/knowledge/${editingId}` : '/api/aurora/knowledge';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddForm(false);
        resetForm();
        fetchEntries();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'Failed to save entry'}`);
      }
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry');
    }
  };

  const handleEdit = (entry: KnowledgeEntry) => {
    setEditingId(entry.id);
    setShowAddForm(true);
    setFormData({
      category: entry.category,
      questionEn: entry.questionEn,
      questionPt: entry.questionPt,
      questionEs: entry.questionEs,
      answerEn: entry.answerEn,
      answerPt: entry.answerPt,
      answerEs: entry.answerEs,
      tags: entry.tags.join(', '),
      priority: entry.priority,
      active: entry.active,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta entrada?')) return;

    try {
      const res = await fetch(`/api/aurora/knowledge/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEntries();
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      questionEn: '',
      questionPt: '',
      questionEs: '',
      answerEn: '',
      answerPt: '',
      answerEs: '',
      tags: '',
      priority: 0,
      active: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      !searchTerm ||
      entry.questionEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.questionPt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.answerEn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || entry.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>🧠 Knowledge Base da Aurora</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          {showAddForm ? 'Cancelar' : '+ Adicionar Conhecimento'}
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar conhecimento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minWidth: '200px' }}
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            {editingId ? 'Editar Conhecimento' : 'Adicionar Novo Conhecimento'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Categoria *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                required
              >
                <option value="">Selecione</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Prioridade</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Perguntas</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>🇬🇧 English *</label>
                <textarea
                  value={formData.questionEn}
                  onChange={(e) => setFormData({ ...formData, questionEn: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    minHeight: '60px',
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>🇵🇹 Português *</label>
                <textarea
                  value={formData.questionPt}
                  onChange={(e) => setFormData({ ...formData, questionPt: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    minHeight: '60px',
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>🇪🇸 Español *</label>
                <textarea
                  value={formData.questionEs}
                  onChange={(e) => setFormData({ ...formData, questionEs: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    minHeight: '60px',
                  }}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Respostas</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>🇬🇧 English *</label>
                <textarea
                  value={formData.answerEn}
                  onChange={(e) => setFormData({ ...formData, answerEn: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    minHeight: '120px',
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>🇵🇹 Português *</label>
                <textarea
                  value={formData.answerPt}
                  onChange={(e) => setFormData({ ...formData, answerPt: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    minHeight: '120px',
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>🇪🇸 Español *</label>
                <textarea
                  value={formData.answerEs}
                  onChange={(e) => setFormData({ ...formData, answerEs: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    minHeight: '120px',
                  }}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="ex: sintra, cascais, pricing"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <span style={{ fontWeight: '500' }}>Ativo</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              {editingId ? 'Atualizar' : 'Adicionar'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: '0.5rem 1.5rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Carregando...</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <span
                    style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginRight: '0.5rem',
                    }}
                  >
                    {entry.category}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Usado {entry.usageCount} vezes • Prioridade: {entry.priority}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: entry.active ? '#d1fae5' : '#fee2e2',
                      color: entry.active ? '#065f46' : '#991b1b',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    {entry.active ? 'ATIVO' : 'INATIVO'}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>🇬🇧 {entry.questionEn}</div>
                <div style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  {entry.answerEn}
                </div>
              </div>

              {entry.tags.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: '#f3f4f6',
                        color: '#374151',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        marginRight: '0.5rem',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(entry)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}

          {filteredEntries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              Nenhuma entrada encontrada. Adicione conhecimento para a Aurora aprender!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
