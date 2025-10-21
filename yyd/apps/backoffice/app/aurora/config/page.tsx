import { prisma } from '@/lib/prisma';
import AuroraConfigManager from './AuroraConfigManager';

async function getAuroraData() {
  const [config, knowledge] = await Promise.all([
    prisma.auroraConfig.findFirst({ where: { active: true } }),
    prisma.auroraKnowledge.findMany({
      orderBy: { priority: 'desc' },
      take: 50,
    }),
  ]);

  return { config, knowledge };
}

export default async function AuroraConfigPage() {
  const { config, knowledge } = await getAuroraData();

  return <AuroraConfigManager initialConfig={config} initialKnowledge={knowledge} />;
}
