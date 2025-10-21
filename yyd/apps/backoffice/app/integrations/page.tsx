import { prisma } from '@/lib/prisma';
import IntegrationManager from './IntegrationManager';

async function getIntegrations() {
  return await prisma.integration.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function IntegrationsPage() {
  const integrations = await getIntegrations();

  const serializedIntegrations = integrations.map((i) => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }));

  return <IntegrationManager initialIntegrations={serializedIntegrations} />;
}
