import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    requirePermission(request, 'settings', 'read');

    const integrations = await prisma.integration.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(integrations);
  } catch (error: any) {
    console.error('Integrations GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requirePermission(request, 'settings', 'manage');
    const body = await request.json();

    const { kind, name, config, active } = body;

    if (!kind || !name) {
      return NextResponse.json(
        { error: 'kind and name are required' },
        { status: 400 }
      );
    }

    const integration = await prisma.integration.create({
      data: {
        kind,
        name,
        config: config || {},
        active: active !== undefined ? active : true,
      },
    });

    await logCRUD(user.userId, user.email, 'create', 'integrations', integration.id, { after: integration }, request);

    return NextResponse.json(integration, { status: 201 });
  } catch (error: any) {
    console.error('Integration POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
