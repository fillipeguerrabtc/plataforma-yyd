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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        setMessage({ type: 'error', text: data.error });
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          💸 Stripe Connect - Sistema Universal de Pagamentos
        </h1>
        <p className="text-gray-600">
          Gerencie contas Stripe e processe pagamentos para todos os colaboradores e parceiros
        </p>
      </div>

      {message && (
        <div
          className={`p-4 mb-6 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-2">
          {(['guide', 'staff', 'vendor'] as EntityType[]).map((tab) => {
            const tabLabel = getLabel(tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-[#1FB7C4] text-[#1FB7C4]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tabLabel.icon} {tabLabel.plural}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Total Disponível</div>
          <div className="text-3xl font-bold text-[#1FB7C4]">
            €{(totalAvailable / 100).toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Contas Ativas</div>
          <div className="text-3xl font-bold text-gray-800">{accountsWithBalance}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Total {label.plural}</div>
          <div className="text-3xl font-bold text-gray-800">{entities.length}</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Carregando {label.plural.toLowerCase()}...</div>
        </div>
      ) : entities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 text-5xl mb-4">{label.icon}</div>
          <p className="text-gray-600">Nenhum {label.singular.toLowerCase()} cadastrado.</p>
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
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{entity.name}</h3>
                      <span className="text-sm text-gray-500">{entity.email}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      {!hasAccount && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          Sem conta
                        </span>
                      )}
                      {hasAccount && !isOnboarded && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          ⚠️ Onboarding pendente
                        </span>
                      )}
                      {hasAccount && isOnboarded && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          ✅ Ativo
                        </span>
                      )}
                      {entity.stripeAccountStatus && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {entity.stripeAccountStatus}
                        </span>
                      )}
                    </div>

                    {balance && (
                      <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Disponível</div>
                          <div className="text-lg font-bold text-green-600">
                            €{(balance.totalAvailable / 100).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Pendente</div>
                          <div className="text-lg font-bold text-yellow-600">
                            €{(balance.totalPending / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {!hasAccount ? (
                      <button
                        onClick={() => createAccount(entity.id)}
                        disabled={isProcessing}
                        className="bg-[#1FB7C4] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a9aa5] disabled:opacity-50"
                      >
                        {isProcessing ? '⏳ Criando...' : '➕ Criar Conta'}
                      </button>
                    ) : (
                      <>
                        {!isOnboarded && (
                          <button
                            onClick={() => generateOnboardingLink(entity.id)}
                            disabled={isProcessing}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
                          >
                            {isProcessing ? '⏳ Gerando...' : '🔗 Completar Onboarding'}
                          </button>
                        )}
                        {isOnboarded && (
                          <>
                            <button
                              onClick={() => generateLoginLink(entity.id)}
                              disabled={isProcessing}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                            >
                              {isProcessing ? '⏳ Gerando...' : '🔐 Dashboard Stripe'}
                            </button>
                            <button
                              onClick={() => refreshBalance(entity.id)}
                              disabled={isProcessing}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 disabled:opacity-50"
                            >
                              {isProcessing ? '⏳ Atualizando...' : '🔄 Atualizar Saldo'}
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
  );
}
