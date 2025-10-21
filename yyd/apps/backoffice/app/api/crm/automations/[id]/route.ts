import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';
import { AutomationUpdateSchema } from '@/lib/validations';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'aurora', 'update');
    const body = await request.json();

    const validation = AutomationUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const before = await prisma.cRMAutomation.findUnique({
      where: { id: params.id },
    });

    if (!before) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    const updated = await prisma.cRMAutomation.update({
      where: { id: params.id },
      data: {
        ...validation.data,
        updatedAt: new Date(),
      },
    });

    await logCRUD(user.userId, user.email, 'update', 'crm_automations', updated.id, { before, after: updated }, request);

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'aurora', 'delete');

    const before = await prisma.cRMAutomation.findUnique({
      where: { id: params.id },
    });

    if (!before) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    await prisma.cRMAutomation.delete({
      where: { id: params.id },
    });

    await logCRUD(user.userId, user.email, 'delete', 'crm_automations', params.id, { before }, request);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
