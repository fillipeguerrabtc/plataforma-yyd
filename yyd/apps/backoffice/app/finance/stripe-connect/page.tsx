'use client';

import { useEffect, useState } from 'react';

type Entity = {
  id: string;
  name: string;
  email: string;
  stripeConnectedAccountId: string | null;
  stripeAccountStatus: string | null;
  stripeOnboardingCompleted: boolean;
};

type EntityType = 'guide' | 'staff' | 'vendor';

export default function StripeConnectPage() {
  const [activeTab, setActiveTab] = useState<EntityType>('guide');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [balances, setBalances] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string; needsSetup?: boolean } | null>(null);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);

  useEffect(() => {
    loadEntities();
  }, [activeTab]);

  const getApiEndpoint = (type: EntityType) => {
    switch (type) {
      case 'guide':
        return '/api/guides';
      case 'staff':
        return '/api/staff';
      case 'vendor':
        return '/api/vendors';
    }
  };

  const getLabel = (type: EntityType) => {
    switch (type) {
      case 'guide':
        return { singular: 'Guia', plural: 'Guias', icon: '🚗' };
      case 'staff':
        return { singular: 'Funcionário', plural: 'Funcionários', icon: '👤' };
      case 'vendor':
        return { singular: 'Fornecedor', plural: 'Fornecedores', icon: '🏢' };
    }
  };

  const loadEntities = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(getApiEndpoint(activeTab));
      if (res.ok) {
        const data = await res.json();
        setEntities(data);

        setBalances(new Map());
        for (const entity of data) {
          if (entity.stripeConnectedAccountId) {
            loadBalance(entity.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async (entityId: string) => {
    try {
      const res = await fetch(
        `/api/stripe-connect/balance?entityType=${activeTab}&entityId=${entityId}`
      );
      if (res.ok) {
        const data = await res.json();
        setBalances((prev) => new Map(prev).set(entityId, data));
      }
    } catch (error) {
      console.error(`Failed to load balance for ${entityId}:`, error);
    }
  };

  const createAccount = async (entityId: string) => {
    setProcessing(entityId);
    setMessage(null);
    try {
      const res = await fetch('/api/stripe-connect/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: activeTab, entityId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        loadEntities();
      } else {
        setMessage({ type: 'error', text: data.error, needsSetup: data.needsSetup });
        if (data.needsSetup) {
          setShowSetupInstructions(true);
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setProcessing(null);
    }
  };

  const generateOnboardingLink = async (entityId: string) => {
    setProcessing(entityId);
    setMessage(null);
    try {
      const res = await fetch('/api/stripe-connect/onboarding-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: activeTab, entityId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        window.open(data.url, '_blank');
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setProcessing(null);
    }
  };

  const generateLoginLink = async (entityId: string) => {
    setProcessing(entityId);
    setMessage(null);
    try {
      const res = await fetch('/api/stripe-connect/login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: activeTab, entityId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        window.open(data.url, '_blank');
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setProcessing(null);
    }
  };

  const refreshBalance = async (entityId: string) => {
    setProcessing(entityId);
    await loadBalance(entityId);
    setProcessing(null);
  };

  const totalAvailable = Array.from(balances.values()).reduce(
    (sum, b) => sum + (b.totalAvailable || 0),
    0
  );

  const accountsWithBalance = balances.size;
  const label = getLabel(activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#635BFF] to-[#0099FF] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💳</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Stripe Connect
              </h1>
              <p className="text-gray-600 text-sm">
                Sistema Universal de Pagamentos para Colaboradores e Parceiros
              </p>
            </div>
          </div>
        </div>

        {/* Setup Instructions Banner */}
        {showSetupInstructions && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <span className="text-3xl">ℹ️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  Configure o Stripe Connect
                </h3>
                <p className="text-blue-800 mb-4">
                  Para usar esta funcionalidade, você precisa ativar o Stripe Connect na sua conta Stripe:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-blue-800 mb-4">
                  <li>Acesse <a href="https://dashboard.stripe.com/settings/applications" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-blue-600">Stripe Dashboard → Settings → Connect</a></li>
                  <li>Clique em "Get Started" e complete o formulário de registro</li>
                  <li>Aceite os termos do Stripe Connect</li>
                  <li>Volte aqui e tente criar as contas novamente</li>
                </ol>
                <button
                  onClick={() => setShowSetupInstructions(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {message && (
          <div
            className={`p-4 mb-6 rounded-lg border shadow-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : message.type === 'warning'
                ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl">
                {message.type === 'success' ? '✅' : message.type === 'warning' ? '⚠️' : '❌'}
              </span>
              <p className="flex-1">{message.text}</p>
              <button onClick={() => setMessage(null)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          <div className="flex gap-1">
            {(['guide', 'staff', 'vendor'] as EntityType[]).map((tab) => {
              const tabLabel = getLabel(tab);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-[#635BFF] to-[#0099FF] text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tabLabel.icon}</span>
                  {tabLabel.plural}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Total Disponível</div>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              €{(totalAvailable / 100).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Saldo disponível para transferência</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Contas Ativas</div>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{accountsWithBalance}</div>
            <div className="text-xs text-gray-500 mt-1">Contas com saldo disponível</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Total {label.plural}</div>
              <span className="text-2xl">{label.icon}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{entities.length}</div>
            <div className="text-xs text-gray-500 mt-1">Cadastrados no sistema</div>
          </div>
        </div>

        {/* Entities List */}
        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-[#635BFF] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Carregando {label.plural.toLowerCase()}...</p>
            </div>
          </div>
        ) : entities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-gray-300 text-6xl mb-4">{label.icon}</div>
            <p className="text-gray-600 text-lg font-medium mb-2">Nenhum {label.singular.toLowerCase()} cadastrado</p>
            <p className="text-gray-500 text-sm">Cadastre {label.plural.toLowerCase()} primeiro para gerenciar suas contas Stripe</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entities.map((entity) => {
              const balance = balances.get(entity.id);
              const hasAccount = !!entity.stripeConnectedAccountId;
              const isOnboarded = entity.stripeOnboardingCompleted;
              const isProcessing = processing === entity.id;

              return (
                <div
                  key={entity.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-2xl">
                          {label.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{entity.name}</h3>
                          <p className="text-sm text-gray-500">{entity.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {!hasAccount && (
                          <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                            📭 Sem conta
                          </span>
                        )}
                        {hasAccount && !isOnboarded && (
                          <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                            ⏳ Onboarding pendente
                          </span>
                        )}
                        {hasAccount && isOnboarded && (
                          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                            ✅ Conta ativa
                          </span>
                        )}
                        {entity.stripeAccountStatus && (
                          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full capitalize">
                            {entity.stripeAccountStatus}
                          </span>
                        )}
                      </div>

                      {balance && (
                        <div className="grid grid-cols-2 gap-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">💵 Disponível</div>
                            <div className="text-2xl font-bold text-green-600">
                              €{(balance.totalAvailable / 100).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">⏳ Pendente</div>
                            <div className="text-2xl font-bold text-yellow-600">
                              €{(balance.totalPending / 100).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {!hasAccount ? (
                        <button
                          onClick={() => createAccount(entity.id)}
                          disabled={isProcessing}
                          className="bg-gradient-to-r from-[#635BFF] to-[#0099FF] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
                        >
                          {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              Criando...
                            </span>
                          ) : (
                            '➕ Criar Conta Stripe'
                          )}
                        </button>
                      ) : (
                        <>
                          {!isOnboarded && (
                            <button
                              onClick={() => generateOnboardingLink(entity.id)}
                              disabled={isProcessing}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 min-w-[180px]"
                            >
                              {isProcessing ? 'Gerando...' : '🚀 Completar Cadastro'}
                            </button>
                          )}
                          {isOnboarded && (
                            <>
                              <button
                                onClick={() => generateLoginLink(entity.id)}
                                disabled={isProcessing}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 min-w-[180px]"
                              >
                                {isProcessing ? 'Gerando...' : '🔐 Dashboard Stripe'}
                              </button>
                              <button
                                onClick={() => refreshBalance(entity.id)}
                                disabled={isProcessing}
                                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 min-w-[180px]"
                              >
                                {isProcessing ? (
                                  <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Atualizando...
                                  </span>
                                ) : (
                                  '🔄 Atualizar Saldo'
                                )}
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
