'use client';

import { useEffect, useState } from 'react';

type Entity = {
  id: string;
  name: string;
  email: string;
  stripeConnectedAccountId: string | null;
};

type EntityType = 'guide' | 'staff' | 'vendor';

type Transfer = {
  id: string;
  amount: number;
  currency: string;
  destination: string;
  description: string | null;
  created: number;
  metadata: Record<string, string>;
};

export default function StripePaymentsPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [selectedType, setSelectedType] = useState<EntityType>('staff');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadEntities();
    loadTransferHistory();
  }, [selectedType]);

  const loadEntities = async () => {
    setLoading(true);
    try {
      const endpoint = selectedType === 'guide' ? '/api/guides' : selectedType === 'staff' ? '/api/staff' : '/api/vendors';
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        // Filter only entities with Stripe account ID
        const filtered = data.filter((e: Entity) => e.stripeConnectedAccountId);
        setEntities(filtered);
      }
    } catch (error) {
      console.error('Failed to load entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransferHistory = async () => {
    try {
      const res = await fetch('/api/stripe-connect/transfer-history?limit=50');
      if (res.ok) {
        const data = await res.json();
        setTransfers(data.transfers || []);
      }
    } catch (error) {
      console.error('Failed to load transfers:', error);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEntity || !amount) {
      setMessage({ type: 'error', text: 'Selecione um beneficiário e informe o valor' });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setMessage({ type: 'error', text: 'Valor inválido' });
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/stripe-connect/direct-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: selectedType,
          entityId: selectedEntity,
          amount: amountNum,
          description: description || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        // Reset form
        setSelectedEntity('');
        setAmount('');
        setDescription('');
        // Reload history
        loadTransferHistory();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const selectedEntityData = entities.find((e) => e.id === selectedEntity);
  const totalTransferred = transfers.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">💸</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Pagamentos via Stripe
              </h1>
              <p className="text-gray-600 mt-1">
                Transferências para colaboradores e fornecedores
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`p-5 mb-6 rounded-xl border-2 shadow-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-900 border-green-300'
                : 'bg-red-50 text-red-900 border-red-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              <p className="flex-1 font-medium">{message.text}</p>
              <button onClick={() => setMessage(null)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span>💳</span>
                  Nova Transferência
                </h2>
                <p className="text-blue-100 mt-1">Pague salários, fornecedores ou parceiros</p>
              </div>

              <form onSubmit={handleTransfer} className="p-8">
                <div className="space-y-6">
                  {/* Entity Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tipo de Beneficiário
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['staff', 'guide', 'vendor'] as EntityType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setSelectedType(type);
                            setSelectedEntity('');
                          }}
                          className={`px-6 py-4 rounded-xl font-semibold transition-all border-2 ${
                            selectedType === type
                              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg scale-105'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {type === 'staff' && '👤 Funcionário'}
                          {type === 'guide' && '🚗 Guia'}
                          {type === 'vendor' && '🏢 Fornecedor'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Entity Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Beneficiário *
                    </label>
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                        Carregando...
                      </div>
                    ) : entities.length === 0 ? (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                        <p className="text-yellow-800 font-medium">
                          ⚠️ Nenhum {selectedType === 'staff' ? 'funcionário' : selectedType === 'guide' ? 'guia' : 'fornecedor'} com Stripe Account ID configurado
                        </p>
                        <p className="text-yellow-600 text-sm mt-2">
                          Configure o Stripe Account ID no perfil do beneficiário primeiro
                        </p>
                      </div>
                    ) : (
                      <select
                        value={selectedEntity}
                        onChange={(e) => setSelectedEntity(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        required
                      >
                        <option value="">Selecione...</option>
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name} - {entity.email}
                          </option>
                        ))}
                      </select>
                    )}
                    {selectedEntityData && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">Conta Stripe:</span> {selectedEntityData.stripeConnectedAccountId}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valor (€) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-500">€</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descrição (opcional)
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: Salário Novembro 2025, Serviço Prestado..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={processing || entities.length === 0}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-5 rounded-xl text-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    {processing ? (
                      <>
                        <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                        Processando...
                      </>
                    ) : (
                      <>
                        <span>💸</span>
                        Efetuar Transferência
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Total Transferred */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold opacity-90">Total Transferido</span>
                <span className="text-3xl">💰</span>
              </div>
              <div className="text-4xl font-bold mb-1">
                €{totalTransferred.toFixed(2)}
              </div>
              <div className="text-sm opacity-80">
                {transfers.length} transferências realizadas
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>ℹ️</span>
                Como Funciona
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-blue-600">1️⃣</span>
                  <span>Configure o <strong>Stripe Account ID</strong> no perfil do beneficiário</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">2️⃣</span>
                  <span>Selecione o beneficiário e valor</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">3️⃣</span>
                  <span>A transferência é <strong>instantânea</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">4️⃣</span>
                  <span>Saldos atualizados nos dashboards Stripe</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Transfer History */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span>📊</span>
              Histórico de Transferências
            </h2>
            <p className="text-purple-100 mt-1">Últimas 50 transferências realizadas</p>
          </div>

          <div className="p-6">
            {transfers.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600 text-lg font-medium">Nenhuma transferência realizada ainda</p>
                <p className="text-gray-500 text-sm mt-2">As transferências aparecerão aqui após serem processadas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Data</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Beneficiário</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Descrição</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">Valor</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">ID Stripe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((transfer) => (
                      <tr key={transfer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {new Date(transfer.created * 1000).toLocaleString('pt-PT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">
                            {transfer.metadata.beneficiary_name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transfer.metadata.entity_type || 'N/A'}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate">
                          {transfer.description || '-'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-bold text-green-600 text-lg">
                            €{transfer.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-500 font-mono">
                          {transfer.id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
