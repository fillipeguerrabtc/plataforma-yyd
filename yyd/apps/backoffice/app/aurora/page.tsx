import { prisma } from '@/lib/prisma';

async function getAuroraStats() {
  const [totalConversations, activeConversations, knowledgeItems] = await Promise.all([
    prisma.auroraConversation.count(),
    prisma.auroraConversation.count({
      where: {
        lastMessageAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24h
        },
      },
    }),
    prisma.auroraKnowledge.count({ where: { active: true } }),
  ]);

  return {
    totalConversations,
    activeConversations,
    knowledgeItems,
  };
}

export default async function AuroraPage() {
  const stats = await getAuroraStats();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          🤖 Aurora IA
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          Assistente IA multilíngue para vendas pelo WhatsApp e Facebook
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          title="Total de Conversas"
          value={stats.totalConversations}
          icon="💬"
          color="var(--brand-turquoise)"
        />
        <StatCard
          title="Conversas Ativas (24h)"
          value={stats.activeConversations}
          icon="📱"
          color="var(--brand-turquoise)"
        />
        <StatCard
          title="Base de Conhecimento"
          value={stats.knowledgeItems}
          icon="📚"
          color="var(--brand-turquoise)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            ✨ Capacidades da Aurora
          </h2>
          <ul style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: '1.8' }}>
            <li>✅ Suporte multilíngue (EN, PT, ES)</li>
            <li>✅ Informações sobre tours e preços</li>
            <li>✅ Reservas completas via chat</li>
            <li>✅ Links de pagamento Stripe</li>
            <li>✅ Confirmação automática</li>
            <li>✅ Follow-ups inteligentes</li>
          </ul>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            📡 Canais Conectados
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ChannelStatus channel="WhatsApp" active={false} />
            <ChannelStatus channel="Facebook Messenger" active={false} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '1rem' }}>
            Configure os secrets nas Integrações para ativar os canais
          </p>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🚀 Como Ativar a Aurora
        </h2>
        <ol style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: '1.8' }}>
          <li>Configure OPENAI_API_KEY (já configurado ✅)</li>
          <li>Configure secrets do WhatsApp: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID</li>
          <li>Configure secrets do Facebook: FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID</li>
          <li>Configure webhooks nos painéis do WhatsApp/Facebook apontando para /api/webhooks/whatsapp e /api/webhooks/facebook</li>
          <li>Aurora começará a responder automaticamente!</li>
        </ol>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
            {title}
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
            {value}
          </p>
        </div>
        <div
          style={{
            width: '48px',
            height: '48px',
            background: `${color}15`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChannelStatus({ channel, active }: { channel: string; active: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        background: active ? 'var(--brand-turquoise)15' : 'var(--gray-100)',
        borderRadius: '8px',
      }}
    >
      <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{channel}</span>
      <span
        style={{
          padding: '0.25rem 0.75rem',
          background: active ? 'var(--brand-turquoise)' : 'var(--gray-300)',
          color: active ? 'white' : 'var(--gray-700)',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: '600',
        }}
      >
        {active ? 'Ativo' : 'Inativo'}
      </span>
    </div>
  );
}
