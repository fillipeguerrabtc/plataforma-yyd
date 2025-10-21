import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';
import { AutomationCreateSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    requirePermission(request, 'aurora', 'read');

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
    const user = requirePermission(request, 'aurora', 'create');
    const body = await request.json();

    const validation = AutomationCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;
    const automation = await prisma.cRMAutomation.create({
      data: {
        name: data.name,
        description: data.description,
        trigger: data.trigger,
        conditions: data.conditions || {},
        actions: data.actions,
        active: data.active,
      },
    });

    await logCRUD(user.userId, user.email, 'create', 'crm_automations', automation.id, { after: automation }, request);

    return NextResponse.json(automation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
