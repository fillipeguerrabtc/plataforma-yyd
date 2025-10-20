import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    requirePermission(request, 'aurora', 'read');

    const config = await prisma.auroraConfig.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(config || {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = requirePermission(request, 'aurora', 'update');
    const body = await request.json();

    let config = await prisma.auroraConfig.findFirst({
      where: { active: true },
    });

    if (!config) {
      config = await prisma.auroraConfig.create({
        data: {
          name: 'default',
          active: true,
        },
      });
    }

    const before = config;

    const updated = await prisma.auroraConfig.update({
      where: { id: config.id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    await logCRUD(user.userId, user.email, 'update', 'aurora_config', updated.id, { before, after: updated }, request);

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
