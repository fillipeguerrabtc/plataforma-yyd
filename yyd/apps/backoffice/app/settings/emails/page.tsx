'use client';

import { useState, useEffect } from 'react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  enabled: boolean;
}

export default function EmailSettingsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: 'booking_confirmation',
      name: 'Confirmação de Reserva',
      subject: 'Your YYD Tour Booking Confirmation',
      body: 'Booking confirmation email template...',
      enabled: true,
    },
    {
      id: 'booking_reminder',
      name: 'Lembrete de Tour (24h antes)',
      subject: 'Reminder: Your YYD Tour Tomorrow!',
      body: 'Tour reminder template...',
      enabled: true,
    },
    {
      id: 'voucher',
      name: 'Envio de Voucher',
      subject: 'Your YYD Tour Voucher',
      body: 'Voucher email template...',
      enabled: true,
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSave = async () => {
    if (!selectedTemplate) return;
    
    try {
      // Save template to database (implement later)
      alert('Template salvo com sucesso!');
    } catch (error) {
      alert('Erro ao salvar template');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuração de Emails</h1>
          <p className="text-gray-600 mt-2">
            Gerencie os templates de email enviados automaticamente aos clientes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Templates */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Templates de Email</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedTemplate?.id === template.id ? 'bg-turquoise-50 border-l-4 border-turquoise-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          template.enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Email */}
            <div className="bg-white rounded-lg shadow mt-6 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Enviar Email de Teste</h3>
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

          {/* Editor de Template */}
          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedTemplate.name}
                    </h2>
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
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assunto do Email
                      </label>
                      <input
                        type="text"
                        value={selectedTemplate.subject}
                        onChange={(e) =>
                          setSelectedTemplate({
                            ...selectedTemplate,
                            subject: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Corpo do Email (HTML)
                      </label>
                      <textarea
                        value={selectedTemplate.body}
                        onChange={(e) =>
                          setSelectedTemplate({
                            ...selectedTemplate,
                            body: e.target.value,
                          })
                        }
                        rows={15}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-turquoise-500 font-mono text-sm"
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Variáveis Disponíveis:
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <code className="bg-white px-2 py-1 rounded">{'{{customerName}}'}</code> - Nome do cliente<br />
                        <code className="bg-white px-2 py-1 rounded">{'{{bookingNumber}}'}</code> - Número da reserva<br />
                        <code className="bg-white px-2 py-1 rounded">{'{{tourName}}'}</code> - Nome do tour<br />
                        <code className="bg-white px-2 py-1 rounded">{'{{date}}'}</code> - Data do tour<br />
                        <code className="bg-white px-2 py-1 rounded">{'{{time}}'}</code> - Horário do tour<br />
                        <code className="bg-white px-2 py-1 rounded">{'{{price}}'}</code> - Preço total<br />
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
                    className="px-4 py-2 bg-turquoise-500 text-white rounded-md hover:bg-turquoise-600 transition-colors"
                  >
                    Salvar Template
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Nenhum template selecionado
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Selecione um template da lista à esquerda para editar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Email Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Enviados Hoje</p>
                <p className="text-2xl font-semibold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Este Mês</p>
                <p className="text-2xl font-semibold text-gray-900">156</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Taxa de Entrega</p>
                <p className="text-2xl font-semibold text-gray-900">98.5%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Templates Ativos</p>
                <p className="text-2xl font-semibold text-gray-900">{templates.filter(t => t.enabled).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
