import { prisma } from '@/lib/prisma';
import IntegrationManager from './IntegrationManager';

async function getIntegrations() {
  return await prisma.integration.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function IntegrationsPage() {
  const integrations = await getIntegrations();

  return <IntegrationManager initialIntegrations={integrations} />;
