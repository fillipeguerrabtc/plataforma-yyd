import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    requirePermission(request, 'customers', 'read');

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    const where: any = {};
    if (active !== null) where.active = active === 'true';

    const automations = await prisma.cRMAutomation.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(automations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requirePermission(request, 'customers', 'create');
    const body = await request.json();

    const { name, description, trigger, conditions, actions } = body;

    if (!name || !trigger || !actions) {
      return NextResponse.json({ error: 'name, trigger, and actions are required' }, { status: 400 });
    }

    const automation = await prisma.cRMAutomation.create({
      data: {
        name,
        description,
        trigger,
        conditions: conditions || {},
        actions,
        active: true,
      },
    });

    await logCRUD(user.userId, user.email, 'create', 'crm_automations', automation.id, { after: automation }, request);

    return NextResponse.json(automation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
