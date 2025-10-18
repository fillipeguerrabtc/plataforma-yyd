'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchWithAuth } from '@/lib/backoffice-auth';

interface AuroraConfig {
  id: string;
  key: string;
  value: any;
  description: string;
  category: string;
  is_active: boolean;
}

interface AuroraStats {
  total_conversations: number;
  total_messages: number;
  knowledge_base_items: number;
  status: string;
}

export default function AuroraPage() {
  const [configs, setConfigs] = useState<AuroraConfig[]>([]);
  const [stats, setStats] = useState<AuroraStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<AuroraConfig | null>(null);

  useEffect(() => {
    loadAuroraData();
  }, []);

  const loadAuroraData = async () => {
    try {
      setLoading(true);
      const [configsRes, statsRes] = await Promise.all([
        fetchWithAuth('/api/v1/backoffice/aurora/config'),
        fetchWithAuth('/api/v1/backoffice/aurora/stats')
      ]);
      
      const configsData = await configsRes.json();
      const statsData = await statsRes.json();
      
      setConfigs(configsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load Aurora data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons: Record<string, string> = {
    core: '🧠',
    sense: '❤️',
    voice: '🎤',
    mind: '📚',
    flow: '⚡',
  };

  const categoryColors: Record<string, string> = {
    core: '#00B5CC',
    sense: '#FF2E2E',
    voice: '#33C5DD',
    mind: '#FFD700',
    flow: '#25D366',
  };

  return (
    <DashboardLayout>
      <div>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          marginBottom: '8px', 
          color: '#222222',
          fontFamily: "'Poppins', sans-serif" 
        }}>
          🤖 Aurora IA
        </h1>
        <p style={{ 
          color: '#5C5C5C', 
          marginBottom: '32px',
          fontFamily: "'Open Sans', sans-serif" 
        }}>
          Configure your AI concierge with affective embeddings and multilingual support.
        </p>

        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
              border: '1px solid #E4E4E4'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#00B5CC',
                fontFamily: "'Poppins', sans-serif",
                marginBottom: '4px'
              }}>
                {stats.total_conversations}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#5C5C5C',
                fontFamily: "'Open Sans', sans-serif"
              }}>
                Total Conversations
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
              border: '1px solid #E4E4E4'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✉️</div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#33C5DD',
                fontFamily: "'Poppins', sans-serif",
                marginBottom: '4px'
              }}>
                {stats.total_messages}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#5C5C5C',
                fontFamily: "'Open Sans', sans-serif"
              }}>
                Total Messages
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
              border: '1px solid #E4E4E4'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: '#FFD700',
                fontFamily: "'Poppins', sans-serif",
                marginBottom: '4px'
              }}>
                {stats.knowledge_base_items}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#5C5C5C',
                fontFamily: "'Open Sans', sans-serif"
              }}>
                Knowledge Items
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
              border: '1px solid #E4E4E4'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                {stats.status === 'operational' ? '✅' : '⏸️'}
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: stats.status === 'operational' ? '#25D366' : '#5C5C5C',
                fontFamily: "'Poppins', sans-serif",
                marginBottom: '4px',
                textTransform: 'capitalize'
              }}>
                {stats.status}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#5C5C5C',
                fontFamily: "'Open Sans', sans-serif"
              }}>
                System Status
              </div>
            </div>
          </div>
        )}

        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#222222',
          fontFamily: "'Poppins', sans-serif"
        }}>
          Configuration Modules
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#5C5C5C' }}>
            Loading Aurora configuration...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {configs.map((config) => (
              <div
                key={config.id}
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                  border: `2px solid ${categoryColors[config.category] || '#E4E4E4'}`,
                  transition: 'all 0.3s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '28px' }}>
                        {categoryIcons[config.category] || '⚙️'}
                      </span>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: categoryColors[config.category] || '#222222',
                        fontFamily: "'Poppins', sans-serif",
                        margin: 0
                      }}>
                        {config.key.replace(/_/g, ' ').toUpperCase()}
                      </h3>
                      <span style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: `${categoryColors[config.category]}20`,
                        color: categoryColors[config.category],
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: '600'
                      }}>
                        {config.category.toUpperCase()}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#5C5C5C',
                      fontFamily: "'Open Sans', sans-serif",
                      margin: 0
                    }}>
                      {config.description}
                    </p>
                  </div>
                </div>

                <div style={{
                  background: '#FAFAFA',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E4E4E4'
                }}>
                  <pre style={{
                    fontSize: '13px',
                    fontFamily: "'Courier New', monospace",
                    color: '#222222',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {JSON.stringify(config.value, null, 2)}
                  </pre>
                </div>

                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <button
                    style={{
                      padding: '10px 20px',
                      borderRadius: '12px',
                      background: categoryColors[config.category] || '#00B5CC',
                      color: 'white',
                      border: 'none',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      boxShadow: '0 3px 8px rgba(0,181,204,0.25)'
                    }}
                    onClick={() => setSelectedConfig(config)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ⚙️ Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
