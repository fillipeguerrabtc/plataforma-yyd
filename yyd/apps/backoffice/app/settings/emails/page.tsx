'use client';

import { useState, useEffect } from 'react';

interface EmailTemplate {
  id: string;
  name: string;
  templateKey: string;
  subjectEn: string;
  subjectPt: string;
  subjectEs: string;
  bodyEn: string;
  bodyPt: string;
  bodyEs: string;
  category: string;
  variables: string[];
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function EmailSettingsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'pt' | 'es'>('pt');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/email-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    try {
      const res = await fetch(`/api/email-templates/${selectedTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTemplate),
      });

      if (res.ok) {
        const updated = await res.json();
        setTemplates(templates.map((t) => (t.id === updated.id ? updated : t)));
        alert('Template salvo com sucesso!');
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      alert('Erro ao salvar template');
    }
  };

  const handleCreate = async (newTemplate: Partial<EmailTemplate>) => {
    try {
      const res = await fetch('/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });

      if (res.ok) {
        const created = await res.json();
        setTemplates([...templates, created]);
        setShowCreateForm(false);
        alert('Template criado com sucesso!');
      } else {
        throw new Error('Failed to create template');
      }
    } catch (error) {
      alert('Erro ao criar template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este template?')) return;

    try {
      const res = await fetch(`/api/email-templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates(templates.filter((t) => t.id !== id));
        if (selectedTemplate?.id === id) setSelectedTemplate(null);
        alert('Template removido com sucesso!');
      }
    } catch (error) {
      alert('Erro ao remover template');
    }
  };

  const handleSendTest = async () => {
    if (!testEmail || !selectedTemplate) return;

    setSending(true);
    try {
      const response = await fetch('/api/emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          templateId: selectedTemplate.id,
        }),
      });

      if (response.ok) {
        alert(`Email de teste enviado para ${testEmail}!`);
      } else {
        throw new Error('Failed to send test email');
      }
    } catch (error) {
      alert('Erro ao enviar email de teste');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando templates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📧 Configuração de Emails</h1>
            <p className="text-gray-600 mt-2">
              Gerencie os templates de email enviados automaticamente aos clientes
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-turquoise-500 text-white px-6 py-3 rounded-lg hover:bg-turquoise-600 font-semibold transition-colors"
          >
            ➕ Novo Template
          </button>
        </div>

        {showCreateForm && <CreateTemplateForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Templates de Email</h2>
                <p className="text-sm text-gray-500 mt-1">{templates.length} templates</p>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedTemplate?.id === template.id ? 'bg-turquoise-50 border-l-4 border-turquoise-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{template.subjectPt}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{template.category}</span>
                          <span className="text-xs text-gray-500">{template.templateKey}</span>
                        </div>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ml-2 ${
                          template.enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow mt-6 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">📨 Enviar Email de Teste</h3>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-turquoise-500"
              />
              <button
                onClick={handleSendTest}
                disabled={!testEmail || !selectedTemplate || sending}
                className="w-full mt-3 bg-turquoise-500 text-white py-2 rounded-md hover:bg-turquoise-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? 'Enviando...' : 'Enviar Teste'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{selectedTemplate.name}</h2>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Ativado</span>
                        <input
                          type="checkbox"
                          checked={selectedTemplate.enabled}
                          onChange={(e) =>
                            setSelectedTemplate({
                              ...selectedTemplate,
                              enabled: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-turquoise-500 rounded focus:ring-turquoise-500"
                        />
                      </label>
                      <button
                        onClick={() => handleDelete(selectedTemplate.id)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        🗑️ Remover
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setActiveLanguage('pt')}
                      className={`px-4 py-2 rounded-md font-semibold ${
                        activeLanguage === 'pt'
                          ? 'bg-turquoise-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🇵🇹 Português
                    </button>
                    <button
                      onClick={() => setActiveLanguage('en')}
                      className={`px-4 py-2 rounded-md font-semibold ${
                        activeLanguage === 'en'
                          ? 'bg-turquoise-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🇬🇧 English
                    </button>
                    <button
                      onClick={() => setActiveLanguage('es')}
                      className={`px-4 py-2 rounded-md font-semibold ${
                        activeLanguage === 'es'
                          ? 'bg-turquoise-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🇪🇸 Español
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chave do Template (identificador único)
                      </label>
                      <input
                        type="text"
                        value={selectedTemplate.templateKey}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria
                      </label>
                      <input
                        type="text"
                        value={selectedTemplate.category}
                        onChange={(e) =>
                          setSelectedTemplate({ ...selectedTemplate, category: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assunto do Email
                      </label>
                      <input
                        type="text"
                        value={
                          activeLanguage === 'en'
                            ? selectedTemplate.subjectEn
                            : activeLanguage === 'pt'
                            ? selectedTemplate.subjectPt
                            : selectedTemplate.subjectEs
                        }
                        onChange={(e) =>
                          setSelectedTemplate({
                            ...selectedTemplate,
                            [`subject${activeLanguage.charAt(0).toUpperCase() + activeLanguage.slice(1)}`]:
                              e.target.value,
                          } as EmailTemplate)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Corpo do Email (HTML)
                      </label>
                      <textarea
                        value={
                          activeLanguage === 'en'
                            ? selectedTemplate.bodyEn
                            : activeLanguage === 'pt'
                            ? selectedTemplate.bodyPt
                            : selectedTemplate.bodyEs
                        }
                        onChange={(e) =>
                          setSelectedTemplate({
                            ...selectedTemplate,
                            [`body${activeLanguage.charAt(0).toUpperCase() + activeLanguage.slice(1)}`]:
                              e.target.value,
                          } as EmailTemplate)
                        }
                        rows={15}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-turquoise-500 font-mono text-sm"
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Variáveis Disponíveis:</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <code className="bg-white px-2 py-1 rounded">{'{{customerName}}'}</code> - Nome do
                        cliente
                        <br />
                        <code className="bg-white px-2 py-1 rounded">{'{{bookingNumber}}'}</code> - Número da
                        reserva
                        <br />
                        <code className="bg-white px-2 py-1 rounded">{'{{tourName}}'}</code> - Nome do tour
                        <br />
                        <code className="bg-white px-2 py-1 rounded">{'{{date}}'}</code> - Data do tour
                        <br />
                        <code className="bg-white px-2 py-1 rounded">{'{{time}}'}</code> - Horário do tour
                        <br />
                        <code className="bg-white px-2 py-1 rounded">{'{{price}}'}</code> - Preço total
                        <br />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-turquoise-500 text-white rounded-md hover:bg-turquoise-600 transition-colors font-semibold"
                  >
                    Salvar Template
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📧</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Selecione um template para editar
                </h3>
                <p className="text-gray-500">
                  Escolha um template da lista ou crie um novo para começar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateTemplateForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (template: Partial<EmailTemplate>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    templateKey: '',
    subjectEn: '',
    subjectPt: '',
    subjectEs: '',
    bodyEn: '',
    bodyPt: '',
    bodyEs: '',
    category: 'booking',
    variables: [] as string[],
    enabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 p-6 border-2 border-turquoise-500">
      <h2 className="text-xl font-bold mb-4">➕ Criar Novo Template</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Template</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: Confirmação de Reserva"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chave (identificador único)
            </label>
            <input
              type="text"
              required
              value={form.templateKey}
              onChange={(e) => setForm({ ...form, templateKey: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: booking_confirmation"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="booking">Reservas</option>
            <option value="marketing">Marketing</option>
            <option value="crm">CRM</option>
            <option value="general">Geral</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assunto (EN)</label>
          <input
            type="text"
            required
            value={form.subjectEn}
            onChange={(e) => setForm({ ...form, subjectEn: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assunto (PT)</label>
          <input
            type="text"
            required
            value={form.subjectPt}
            onChange={(e) => setForm({ ...form, subjectPt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assunto (ES)</label>
          <input
            type="text"
            required
            value={form.subjectEs}
            onChange={(e) => setForm({ ...form, subjectEs: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Corpo do Email (EN)</label>
          <textarea
            required
            value={form.bodyEn}
            onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
            placeholder="HTML template..."
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-turquoise-500 text-white rounded-md hover:bg-turquoise-600 font-semibold"
          >
            Criar Template
          </button>
        </div>
      </form>
    </div>
  );
}
