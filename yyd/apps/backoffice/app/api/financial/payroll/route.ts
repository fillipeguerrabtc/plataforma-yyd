import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';
import { PayrollCreateSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    requirePermission(request, 'finance', 'read');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const payrollType = searchParams.get('payrollType');
    const period = searchParams.get('period');

    const where: any = {};
    if (status) where.status = status;
    if (payrollType) where.payrollType = payrollType;
    if (period) where.period = period;

    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        guide: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { periodStart: 'desc' },
    });

    return NextResponse.json(payrolls);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requirePermission(request, 'finance', 'create');
    const body = await request.json();

    const validation = PayrollCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;
    const netAmount = data.grossAmount - data.deductions;

    const payroll = await prisma.payroll.create({
      data: {
        employeeId: data.employeeId,
        guideId: data.guideId,
        vendorName: data.vendorName,
        payrollType: data.payrollType,
        period: data.period,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        grossAmount: data.grossAmount,
        deductions: data.deductions,
        netAmount,
        currency: data.currency,
        status: data.status,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        metadata: data.metadata || {},
      },
    });

    await logCRUD(user.userId, user.email, 'create', 'payroll', payroll.id, { after: payroll }, request);

    return NextResponse.json(payroll);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
