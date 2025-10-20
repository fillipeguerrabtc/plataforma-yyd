import { prisma } from '@/lib/prisma';

async function getIntegrations() {
  return await prisma.integration.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function IntegrationsPage() {
  const integrations = await getIntegrations();

  const stripeActive = integrations.find((i) => i.kind === 'stripe')?.active || false;
  const whatsappActive = integrations.find((i) => i.kind === 'whatsapp')?.active || false;
  const facebookActive = integrations.find((i) => i.kind === 'facebook')?.active || false;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
          🔗 Integrações
        </h1>
        <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
          Configure as integrações de pagamento e mensagens
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <IntegrationCard
          title="Stripe"
          description="Processamento de pagamentos seguro para todas as reservas"
          icon="💳"
          active={stripeActive}
          color="var(--brand-turquoise)"
          status="Conectado via secrets STRIPE_SECRET_KEY"
        />

        <IntegrationCard
          title="WhatsApp Cloud API"
          description="Mensagens diretas e Aurora IA via WhatsApp Business"
          icon="💬"
          active={whatsappActive}
          color="#25D366"
          status={whatsappActive ? 'Ativo' : 'Configure WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID'}
        />

        <IntegrationCard
          title="Facebook Messenger"
          description="Atendimento via Facebook Messenger e integração Aurora IA"
          icon="📱"
          active={facebookActive}
          color="#0084FF"
          status={facebookActive ? 'Ativo' : 'Configure FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID'}
        />
      </div>

      <div style={{ marginTop: '2rem', background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          📋 Como Configurar Integrações
        </h2>
        <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>1. Stripe:</strong> Já configurado via secrets STRIPE_SECRET_KEY e NEXT_PUBLIC_STRIPE_PUBLIC_KEY
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>2. WhatsApp:</strong> Configure os secrets WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_BUSINESS_ACCOUNT_ID
          </p>
          <p>
            <strong>3. Facebook:</strong> Configure os secrets FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID, FACEBOOK_VERIFY_TOKEN
          </p>
        </div>
      </div>
    </div>
  );
}

function IntegrationCard({
  title,
  description,
  icon,
  active,
  color,
  status,
}: {
  title: string;
  description: string;
  icon: string;
  active: boolean;
  color: string;
  status: string;
}) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: active ? `2px solid ${color}` : '2px solid var(--gray-200)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            background: `${color}15`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--brand-black)' }}>
              {title}
            </h3>
            {active ? (
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  background: `${color}15`,
                  color,
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}
              >
                Ativo
              </span>
            ) : (
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  background: 'var(--gray-200)',
                  color: 'var(--gray-700)',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}
              >
                Inativo
              </span>
            )}
          </div>

          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {description}
          </p>

          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}
