"use client";

import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

export default function AuroraAdvancedPage() {
  const [activeTab, setActiveTab] = useState('knowledge');
  const [newKnowledge, setNewKnowledge] = useState({ category: 'tours', content: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const addKnowledge = async () => {
    if (!newKnowledge.content.trim()) return;

    try {
      const response = await fetch('/api/v1/aurora/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKnowledge)
      });
      
      if (response.ok) {
        alert('✅ Conhecimento adicionado com sucesso!');
        setNewKnowledge({ category: 'tours', content: '' });
      }
    } catch (error) {
      alert('❌ Erro ao adicionar conhecimento');
    }
  };

  const searchKnowledge = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch('/api/v1/aurora/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, top_k: 10 })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const tabs = [
    { id: 'knowledge', label: '📚 Knowledge Base', color: '#FFD700' },
    { id: 'behaviors', label: '🎭 Comportamentos', color: '#00B5CC' },
    { id: 'sales', label: '💳 Vendas & Stripe', color: '#635BFF' },
    { id: 'scheduling', label: '📅 Agendamento', color: '#4CAF50' },
  ];

  return (
    <DashboardLayout>
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', fontFamily: "'Poppins', sans-serif" }}>
          🚀 Aurora IA - Configuração Avançada
        </h1>
        <p style={{ color: '#5C5C5C', marginBottom: '32px', fontFamily: "'Open Sans', sans-serif" }}>
          Configure Knowledge Base, comportamentos de vendas, agendamento automático e integrações
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #E4E4E4' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? tab.color : 'transparent',
                color: activeTab === tab.id ? 'white' : '#5C5C5C',
                borderRadius: '12px 12px 0 0',
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: activeTab === tab.id ? '600' : 'normal',
                transition: 'all 0.3s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge' && (
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 3px 10px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px', fontFamily: "'Poppins', sans-serif" }}>
              📚 Knowledge Base (pgvector + RAG)
            </h2>
            
            {/* Search */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '12px', fontFamily: "'Poppins', sans-serif" }}>
                🔍 Busca Semântica
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Buscar conhecimento usando similaridade vetorial..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #E4E4E4',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontFamily: "'Open Sans', sans-serif"
                  }}
                />
                <button
                  onClick={searchKnowledge}
                  style={{
                    padding: '12px 32px',
                    backgroundColor: '#FFD700',
                    color: '#1A1A1A',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Add Knowledge */}
            <div style={{ padding: '24px', backgroundColor: '#FAFAFA', borderRadius: '12px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', fontFamily: "'Poppins', sans-serif" }}>
                ➕ Adicionar Conhecimento
              </h3>
              
              <select
                value={newKnowledge.category}
                onChange={(e) => setNewKnowledge({ ...newKnowledge, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '2px solid #E4E4E4',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: "'Open Sans', sans-serif"
                }}
              >
                <option value="tours">Tours YYD</option>
                <option value="faqs">FAQs</option>
                <option value="policies">Políticas</option>
                <option value="sales">Técnicas de Vendas</option>
                <option value="upsell">Upsell & Cross-sell</option>
              </select>

              <textarea
                placeholder="Digite o conhecimento que Aurora deve aprender (será convertido em embeddings)..."
                value={newKnowledge.content}
                onChange={(e) => setNewKnowledge({ ...newKnowledge, content: e.target.value })}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E4E4E4',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: "'Open Sans', sans-serif',
                  marginBottom: '12px'
                }}
              />

              <button
                onClick={addKnowledge}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#00B5CC',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                Adicionar Conhecimento
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', fontFamily: "'Poppins', sans-serif" }}>
                  Resultados ({searchResults.length})
                </h3>
                {searchResults.map((item: any, idx: number) => (
                  <div key={idx} style={{ 
                    padding: '16px', 
                    border: '2px solid #E4E4E4', 
                    borderRadius: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        backgroundColor: '#FFD700',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {item.category}
                      </span>
                      {item.similarity && (
                        <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                          {(item.similarity * 100).toFixed(1)}% similaridade
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: "'Open Sans', sans-serif" }}>{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Behaviors Tab */}
        {activeTab === 'behaviors' && (
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 3px 10px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px', fontFamily: "'Poppins', sans-serif" }}>
              🎭 Comportamentos & Personalidade
            </h2>
            
            <p style={{ marginBottom: '24px', color: '#5C5C5C', fontFamily: "'Open Sans', sans-serif" }}>
              Aurora é persuasiva, elegante e humana. Configure seu comportamento em diferentes cenários.
            </p>

            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                { 
                  title: 'Tom de Voz', 
                  desc: 'Como Aurora se comunica',
                  current: 'Caloroso e Acolhedor',
                  options: ['Formal', 'Caloroso', 'Casual', 'Profissional']
                },
                { 
                  title: 'Nível de Persuasão', 
                  desc: 'Quão insistente é nas vendas',
                  current: '7/10 - Assertivo mas elegante',
                  options: ['Sutil', 'Moderado', 'Assertivo', 'Agressivo']
                },
                { 
                  title: 'Upsell Automático', 
                  desc: 'Sugerir tours adicionais',
                  current: 'Ativado - Após 2ª mensagem',
                  options: ['Desativado', 'Após 1ª msg', 'Após 2ª msg', 'Sempre']
                },
                { 
                  title: 'Tempo de Resposta', 
                  desc: 'Velocidade vs qualidade',
                  current: 'Balanceado (0.5s médio)',
                  options: ['Rápido', 'Balanceado', 'Detalhado']
                }
              ].map((behavior, idx) => (
                <div key={idx} style={{ 
                  padding: '20px', 
                  border: '2px solid #E4E4E4', 
                  borderRadius: '12px',
                  backgroundColor: '#FAFAFA'
                }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#00B5CC', fontFamily: "'Poppins', sans-serif" }}>
                    {behavior.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#5C5C5C', marginBottom: '12px', fontFamily: "'Open Sans', sans-serif" }}>
                    {behavior.desc}
                  </p>
                  <div style={{ 
                    padding: '12px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    border: '2px solid #00B5CC'
                  }}>
                    {behavior.current}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sales & Stripe Tab */}
        {activeTab === 'sales' && (
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 3px 10px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px', fontFamily: "'Poppins', sans-serif" }}>
              💳 Vendas & Pagamentos Stripe
            </h2>
            
            <div style={{ padding: '24px', backgroundColor: '#FFF3E0', borderRadius: '12px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#E9C46A', fontFamily: "'Poppins', sans-serif" }}>
                💰 Aurora Vende Automaticamente!
              </h3>
              <ul style={{ color: '#5C5C5C', paddingLeft: '24px', fontFamily: "'Open Sans', sans-serif" }}>
                <li>Entende necessidades (embeddings afetivos em ℝ³)</li>
                <li>Recomenda tours personalizados (RAG + histórico)</li>
                <li>Calcula preços com upsell inteligente</li>
                <li>Processa pagamentos via Stripe</li>
                <li>Envia confirmações automáticas</li>
                <li>Agenda guias disponíveis</li>
              </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '24px', backgroundColor: '#E8F9FA', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00B5CC', fontFamily: "'Poppins', sans-serif" }}>
                  €12,450
                </div>
                <p style={{ color: '#5C5C5C', fontFamily: "'Open Sans', sans-serif" }}>Vendas por Aurora (mês)</p>
              </div>
              <div style={{ padding: '24px', backgroundColor: '#E8F5E9', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50', fontFamily: "'Poppins', sans-serif" }}>
                  89
                </div>
                <p style={{ color: '#5C5C5C', fontFamily: "'Open Sans', sans-serif" }}>Bookings confirmados</p>
              </div>
              <div style={{ padding: '24px', backgroundColor: '#FFF3E0', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#E9C46A', fontFamily: "'Poppins', sans-serif" }}>
                  68%
                </div>
                <p style={{ color: '#5C5C5C', fontFamily: "'Open Sans', sans-serif" }}>Taxa de conversão</p>
              </div>
            </div>

            <div style={{ padding: '24px', border: '2px solid #635BFF', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#635BFF', fontFamily: "'Poppins', sans-serif" }}>
                ⚙️ Configurações Stripe
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: "'Poppins', sans-serif" }}>
                    Modo
                  </label>
                  <select style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '2px solid #E4E4E4', 
                    borderRadius: '12px',
                    fontFamily: "'Open Sans', sans-serif"
                  }}>
                    <option>Test (Sandbox)</option>
                    <option>Production (Live)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: "'Poppins', sans-serif" }}>
                    Moedas Aceitas
                  </label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {['EUR', 'USD', 'BRL'].map(currency => (
                      <label key={currency} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Open Sans', sans-serif" }}>
                        <input type="checkbox" defaultChecked />
                        {currency}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scheduling Tab */}
        {activeTab === 'scheduling' && (
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 3px 10px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px', fontFamily: "'Poppins', sans-serif" }}>
              📅 Agendamento de Guias & Tours
            </h2>
            
            <div style={{ padding: '24px', backgroundColor: '#E8F9FA', borderRadius: '12px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#00B5CC', fontFamily: "'Poppins', sans-serif" }}>
                📅 Aurora Gerencia Agendas!
              </h3>
              <ol style={{ color: '#5C5C5C', paddingLeft: '24px', fontFamily: "'Open Sans', sans-serif" }}>
                <li>Verifica disponibilidade de guias certificados</li>
                <li>Confirma disponibilidade de veículos elétricos</li>
                <li>Reserva automaticamente o slot</li>
                <li>Envia notificações ao guia e cliente</li>
                <li>Cria evento no Google Calendar</li>
              </ol>
            </div>

            <h3 style={{ fontSize: '18px', marginBottom: '16px', fontFamily: "'Poppins', sans-serif" }}>
              Guias Disponíveis Hoje
            </h3>
            
            {[
              { name: 'João Silva', tours: 2, rating: 4.9, languages: ['PT', 'EN'], status: 'available' },
              { name: 'Maria Santos', tours: 3, rating: 5.0, languages: ['PT', 'ES', 'EN'], status: 'busy' },
              { name: 'Pedro Costa', tours: 1, rating: 4.8, languages: ['PT', 'EN'], status: 'available' }
            ].map((guide, idx) => (
              <div key={idx} style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#FAFAFA',
                borderRadius: '12px',
                marginBottom: '12px',
                border: `2px solid ${guide.status === 'available' ? '#4CAF50' : '#E4E4E4'}`
              }}>
                <div>
                  <h4 style={{ fontSize: '16px', marginBottom: '4px', fontFamily: "'Poppins', sans-serif" }}>
                    {guide.name}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#5C5C5C', fontFamily: "'Open Sans', sans-serif" }}>
                    {guide.tours} tours hoje · ⭐ {guide.rating} · {guide.languages.join(', ')}
                  </p>
                </div>
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: guide.status === 'available' ? '#4CAF50' : '#999',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  {guide.status === 'available' ? '✓ Disponível' : 'Ocupado'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
