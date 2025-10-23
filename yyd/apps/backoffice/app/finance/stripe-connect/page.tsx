'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, CreditCard, Users, Briefcase, Building2, TrendingUp, Clock, ArrowRight, Send } from 'lucide-react';

type Entity = {
  id: string;
  name: string;
  email: string;
  stripeConnectedAccountId: string | null;
  hasStripeAccount?: boolean;
  stripeStatus?: string;
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
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [selectedEntityForPayment, setSelectedEntityForPayment] = useState<Entity | null>(null);

  // Form state
  const [selectedType, setSelectedType] = useState<EntityType>('staff');
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
        // Show ALL entities, not just those with Stripe configured
        setEntities(data);
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

  const handlePayClick = (entity: Entity) => {
    setSelectedEntityForPayment(entity);
    setShowPaymentDrawer(true);
    setAmount('');
    setDescription('');
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEntityForPayment || !amount) {
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
          entityId: selectedEntityForPayment.id,
          amount: amountNum,
          description: description || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setShowPaymentDrawer(false);
        setSelectedEntityForPayment(null);
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

  const totalTransferred = transfers.reduce((sum, t) => sum + t.amount, 0);
  const entitiesWithStripe = entities.filter(e => e.hasStripeAccount).length;

  const getStatusBadge = (entity: Entity) => {
    if (entity.hasStripeAccount) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Configurado</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Não configurado</span>
        </div>
      );
    }
  };

  const entityTypeConfig = {
    staff: { icon: Users, label: 'Funcionários', color: 'from-[#1FB7C4] to-cyan-600' },
    guide: { icon: Briefcase, label: 'Guias', color: 'from-amber-500 to-orange-600' },
    vendor: { icon: Building2, label: 'Fornecedores', color: 'from-purple-500 to-indigo-600' },
  };

  const TypeIcon = entityTypeConfig[selectedType].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header com identidade YYD */}
      <div className="bg-gradient-to-r from-[#1FB7C4] via-cyan-500 to-teal-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Pagamentos Stripe Connect
              </h1>
              <p className="text-cyan-50 text-sm">
                Sistema de pagamentos para funcionários, guias e fornecedores
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
                <div className="text-xs text-cyan-100 mb-1">Total Transferido</div>
                <div className="text-2xl font-bold text-white">€{totalTransferred.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border-l-4 shadow-md ${
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Transferências</div>
                <div className="text-3xl font-bold text-gray-900">{transfers.length}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#1FB7C4] to-cyan-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Com Stripe</div>
                <div className="text-3xl font-bold text-gray-900">{entitiesWithStripe}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Pago</div>
                <div className="text-3xl font-bold text-gray-900">€{totalTransferred.toFixed(2)}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Entity Type Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TypeIcon className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Selecione o Tipo</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(['staff', 'guide', 'vendor'] as EntityType[]).map((type) => {
              const config = entityTypeConfig[type];
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setShowPaymentDrawer(false);
                  }}
                  className={`group relative overflow-hidden px-6 py-4 rounded-xl font-semibold transition-all border-2 ${
                    selectedType === type
                      ? `bg-gradient-to-br ${config.color} text-white border-transparent shadow-lg scale-105`
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#1FB7C4] hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className={`w-5 h-5 ${selectedType === type ? 'text-white' : 'text-gray-600'}`} />
                    <span>{config.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Entities List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {entityTypeConfig[selectedType].label}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {entities.length} {selectedType === 'staff' ? 'funcionários' : selectedType === 'guide' ? 'guias' : 'fornecedores'} cadastrados
            </p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1FB7C4] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando...</p>
              </div>
            ) : entities.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TypeIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">
                  Nenhum {selectedType === 'staff' ? 'funcionário' : selectedType === 'guide' ? 'guia' : 'fornecedor'} cadastrado
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Nome</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status Stripe</th>
                    <th className="text-right py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entities.map((entity) => (
                    <tr key={entity.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{entity.name}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">{entity.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(entity)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {entity.hasStripeAccount ? (
                          <button
                            onClick={() => handlePayClick(entity)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1FB7C4] to-cyan-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all hover:scale-105"
                          >
                            <Send className="w-4 h-4" />
                            Pagar
                          </button>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-medium text-sm cursor-not-allowed"
                            title="Configure o Stripe Account ID no perfil primeiro"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Configurar Stripe
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Payment Drawer */}
        {showPaymentDrawer && selectedEntityForPayment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-[#1FB7C4] to-cyan-600 px-6 py-5 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Nova Transferência</h3>
                  <button
                    onClick={() => {
                      setShowPaymentDrawer(false);
                      setSelectedEntityForPayment(null);
                    }}
                    className="text-white/80 hover:text-white text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              <form onSubmit={handleTransfer} className="p-6 space-y-6">
                {/* Beneficiary Info */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">Beneficiário</div>
                  <div className="font-semibold text-gray-900">{selectedEntityForPayment.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{selectedEntityForPayment.email}</div>
                  {selectedEntityForPayment.stripeConnectedAccountId && (
                    <div className="text-xs text-gray-500 mt-2 font-mono">
                      {selectedEntityForPayment.stripeConnectedAccountId}
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
                      className="w-full pl-12 pr-4 py-3 text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-[#1FB7C4] focus:ring-2 focus:ring-[#1FB7C4]/20 transition-all outline-none"
                      required
                      autoFocus
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
                    placeholder="Ex: Salário Novembro 2025"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1FB7C4] focus:ring-2 focus:ring-[#1FB7C4]/20 transition-all outline-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-xl text-lg font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Confirmar Transferência
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Transfer History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Histórico de Transferências</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Últimas 50 transferências realizadas</p>
          </div>

          <div className="overflow-x-auto">
            {transfers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">Nenhuma transferência realizada</p>
                <p className="text-gray-500 text-sm mt-2">As transferências aparecerão aqui após serem processadas</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Data</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Beneficiário</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Descrição</th>
                    <th className="text-right py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(transfer.created * 1000).toLocaleString('pt-PT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {transfer.metadata.beneficiary_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {transfer.metadata.entity_type || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate">
                        {transfer.description || '-'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-bold text-emerald-600 text-lg">
                          €{transfer.amount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
