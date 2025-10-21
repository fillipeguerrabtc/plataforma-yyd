import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

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

    const {
      employeeId,
      guideId,
      vendorName,
      payrollType,
      period,
      periodStart,
      periodEnd,
      grossAmount,
      deductions,
      paymentMethod,
      notes,
      metadata,
    } = body;

    if (!payrollType || !period || !periodStart || !periodEnd || !grossAmount) {
      return NextResponse.json(
        { error: 'payrollType, period, periodStart, periodEnd, and grossAmount are required' },
        { status: 400 }
      );
    }

    const netAmount = parseFloat(grossAmount) - parseFloat(deductions || 0);

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        guideId,
        vendorName,
        payrollType,
        period,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        grossAmount: parseFloat(grossAmount),
        deductions: parseFloat(deductions || 0),
        netAmount,
        currency: 'EUR',
        status: 'pending',
        paymentMethod,
        notes,
        metadata: metadata || {},
      },
    });

    await logCRUD(user.userId, user.email, 'create', 'payroll', payroll.id, { after: payroll }, request);

    return NextResponse.json(payroll);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
