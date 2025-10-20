import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requirePermission(request, 'settings', 'read');

    const integration = await prisma.integration.findUnique({
      where: { id: params.id },
    });

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    return NextResponse.json(integration);
  } catch (error: any) {
    console.error('Integration GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'settings', 'manage');
    const body = await request.json();

    const before = await prisma.integration.findUnique({
      where: { id: params.id },
    });

    if (!before) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    const { kind, name, config, active } = body;

    const integration = await prisma.integration.update({
      where: { id: params.id },
      data: {
        ...(kind && { kind }),
        ...(name && { name }),
        ...(config && { config }),
        ...(active !== undefined && { active }),
      },
    });

    await logCRUD(user.userId, user.email, 'update', 'integrations', integration.id, { before, after: integration }, request);

    return NextResponse.json(integration);
  } catch (error: any) {
    console.error('Integration PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'settings', 'manage');

    const before = await prisma.integration.findUnique({
      where: { id: params.id },
    });

    if (!before) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    await prisma.integration.delete({
      where: { id: params.id },
    });

    await logCRUD(user.userId, user.email, 'delete', 'integrations', params.id, { before }, request);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Integration DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
