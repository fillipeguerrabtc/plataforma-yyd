'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Send, DollarSign, Clock, User, Users, Briefcase, Building2, TrendingUp, FileText } from 'lucide-react';

type Entity = {
  id: string;
  name: string;
  email: string;
  stripeConnectedAccountId: string | null;
  hasStripeAccount?: boolean;
  stripeStatus?: string;
};

type EntityType = 'staff' | 'guide' | 'vendor';

type Transfer = {
  id: string;
  amount: number;
  currency: string;
  destination: string;
  description: string | null;
  created: number;
  metadata: Record<string, string>;
};

type TabType = 'staff' | 'guide' | 'vendor' | 'history';

export default function StripePaymentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('staff');
  const [staff, setStaff] = useState<Entity[]>([]);
  const [guides, setGuides] = useState<Entity[]>([]);
  const [vendors, setVendors] = useState<Entity[]>([]);
  const [allTransfers, setAllTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStaff(),
        loadGuides(),
        loadVendors(),
        loadTransferHistory()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (error) {
      console.error('Failed to load staff:', error);
    }
  };

  const loadGuides = async () => {
    try {
      const res = await fetch('/api/guides');
      if (res.ok) {
        const data = await res.json();
        setGuides(data);
      }
    } catch (error) {
      console.error('Failed to load guides:', error);
    }
  };

  const loadVendors = async () => {
    try {
      const res = await fetch('/api/vendors');
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
      }
    } catch (error) {
      console.error('Failed to load vendors:', error);
    }
  };

  const loadTransferHistory = async () => {
    try {
      const res = await fetch('/api/stripe-connect/transfer-history?limit=100');
      if (res.ok) {
        const data = await res.json();
        setAllTransfers(data.transfers || []);
      }
    } catch (error) {
      console.error('Failed to load transfers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEntityId || !amount) {
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
          entityType: activeTab === 'staff' ? 'staff' : activeTab === 'guide' ? 'guide' : 'vendor',
          entityId: selectedEntityId,
          amount: amountNum,
          description: description || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setSelectedEntityId('');
        setAmount('');
        setDescription('');
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

  const getCurrentEntities = () => {
    switch (activeTab) {
      case 'staff': return staff;
      case 'guide': return guides;
      case 'vendor': return vendors;
      default: return [];
    }
  };

  const getFilteredTransfers = () => {
    if (activeTab === 'history') return allTransfers;
    
    const entityTypeMap = {
      'staff': 'staff',
      'guide': 'guide',
      'vendor': 'vendor'
    };
    
    return allTransfers.filter(t => t.metadata.entity_type === entityTypeMap[activeTab]);
  };

  const getTotalTransferred = (transfers: Transfer[]) => {
    return transfers.reduce((sum, t) => sum + t.amount, 0);
  };

  const entities = getCurrentEntities();
  const filteredTransfers = getFilteredTransfers();
  const selectedEntity = entities.find(e => e.id === selectedEntityId);
  const entitiesWithStripe = entities.filter(e => e.hasStripeAccount).length;

  const tabs = [
    { id: 'staff' as TabType, label: 'Funcionários', icon: Users, color: 'from-[#1FB7C4] to-cyan-600' },
    { id: 'guide' as TabType, label: 'Guias', icon: Briefcase, color: 'from-amber-500 to-orange-600' },
    { id: 'vendor' as TabType, label: 'Fornecedores', icon: Building2, color: 'from-purple-500 to-indigo-600' },
    { id: 'history' as TabType, label: 'Histórico Completo', icon: FileText, color: 'from-slate-600 to-gray-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pagamentos via Stripe Connect
          </h1>
          <p className="text-gray-600">
            Sistema de transferências para funcionários, guias e fornecedores
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Funcionários</div>
                <div className="text-3xl font-bold text-gray-900">{staff.length}</div>
                <div className="text-xs text-emerald-600 mt-1">{staff.filter(s => s.hasStripeAccount).length} com Stripe</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#1FB7C4] to-cyan-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Guias</div>
                <div className="text-3xl font-bold text-gray-900">{guides.length}</div>
                <div className="text-xs text-emerald-600 mt-1">{guides.filter(g => g.hasStripeAccount).length} com Stripe</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Fornecedores</div>
                <div className="text-3xl font-bold text-gray-900">{vendors.length}</div>
                <div className="text-xs text-emerald-600 mt-1">{vendors.filter(v => v.hasStripeAccount).length} com Stripe</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Pago</div>
                <div className="text-3xl font-bold text-gray-900">R${getTotalTransferred(allTransfers).toFixed(2)}</div>
                <div className="text-xs text-gray-500 mt-1">{allTransfers.length} transferências</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border-l-4 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : 'bg-red-50 border-red-500 text-red-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className="flex-1 font-medium text-sm">{message.text}</p>
              <button 
                onClick={() => setMessage(null)} 
                className="text-gray-400 hover:text-gray-600 text-lg font-bold leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedEntityId('');
                      setAmount('');
                      setDescription('');
                      setMessage(null);
                    }}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-[#1FB7C4] text-[#1FB7C4] bg-cyan-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab !== 'history' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Form */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Novo Pagamento
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Beneficiário *
                      </label>
                      <select
                        value={selectedEntityId}
                        onChange={(e) => setSelectedEntityId(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1FB7C4] focus:ring-2 focus:ring-[#1FB7C4]/20 transition-all outline-none"
                        required
                      >
                        <option value="">Selecione...</option>
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id} disabled={!entity.hasStripeAccount}>
                            {entity.name} - {entity.email} {!entity.hasStripeAccount && '(Sem Stripe)'}
                          </option>
                        ))}
                      </select>
                      {selectedEntity && (
                        <div className="mt-2">
                          {selectedEntity.hasStripeAccount ? (
                            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                              <CheckCircle className="w-4 h-4" />
                              <span>Conta Stripe configurada</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                              <AlertCircle className="w-4 h-4" />
                              <span>Configure o Stripe Account ID no perfil primeiro</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor (R$) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-500">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-2.5 text-lg font-semibold border border-gray-300 rounded-lg focus:border-[#1FB7C4] focus:ring-2 focus:ring-[#1FB7C4]/20 transition-all outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição (opcional)
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Salário Novembro 2025"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#1FB7C4] focus:ring-2 focus:ring-[#1FB7C4]/20 transition-all outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={processing || !selectedEntity?.hasStripeAccount}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Efetuar Transferência
                        </>
                      )}
                    </button>
                  </form>

                  {/* Stats for current tab */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Estatísticas</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total cadastrados:</span>
                        <span className="font-semibold text-gray-900">{entities.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Com Stripe:</span>
                        <span className="font-semibold text-emerald-600">{entitiesWithStripe}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transferências realizadas:</span>
                        <span className="font-semibold text-gray-900">{filteredTransfers.length}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-300">
                        <span className="text-gray-600 font-semibold">Total pago:</span>
                        <span className="font-bold text-lg text-emerald-600">R${getTotalTransferred(filteredTransfers).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transfer History for current tab */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Histórico de Transferências
                    </h3>
                    <span className="text-sm text-gray-500">
                      {filteredTransfers.length} transferências
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden max-h-[600px] overflow-y-auto">
                    {filteredTransfers.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">Nenhuma transferência realizada</p>
                        <p className="text-gray-500 text-sm mt-1">As transferências aparecerão aqui</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredTransfers.map((transfer) => (
                          <div key={transfer.id} className="p-4 hover:bg-white transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {transfer.metadata.beneficiary_name || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(transfer.created * 1000).toLocaleString('pt-PT', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-emerald-600 text-lg">
                                  R${transfer.amount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            {transfer.description && (
                              <div className="text-sm text-gray-600 mt-1">{transfer.description}</div>
                            )}
                            <div className="text-xs text-gray-400 mt-2 font-mono">{transfer.id}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Full History Tab */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Histórico Completo de Transferências
                  </h3>
                  <div className="text-sm text-gray-600">
                    Total: <span className="font-bold text-emerald-600">R${getTotalTransferred(allTransfers).toFixed(2)}</span>
                    {' · '}
                    {allTransfers.length} transferências
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {allTransfers.length === 0 ? (
                    <div className="text-center py-16">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Nenhuma transferência realizada</p>
                      <p className="text-gray-500 text-sm mt-2">O histórico completo aparecerá aqui</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Data</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Beneficiário</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Tipo</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Descrição</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {allTransfers.map((transfer) => (
                            <tr key={transfer.id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                                {new Date(transfer.created * 1000).toLocaleString('pt-PT', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-gray-900">
                                  {transfer.metadata.beneficiary_name || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {transfer.metadata.beneficiary_email || ''}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  transfer.metadata.entity_type === 'staff' ? 'bg-cyan-100 text-cyan-800' :
                                  transfer.metadata.entity_type === 'guide' ? 'bg-amber-100 text-amber-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {transfer.metadata.entity_type === 'staff' ? 'Funcionário' :
                                   transfer.metadata.entity_type === 'guide' ? 'Guia' : 'Fornecedor'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                                {transfer.description || '-'}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-bold text-emerald-600 text-base">
                                  R${transfer.amount.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
