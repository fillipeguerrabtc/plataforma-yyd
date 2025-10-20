import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess, requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

// GET /api/financial/ap - List accounts payable
export async function GET(request: NextRequest) {
  try {
    // Require access to finance resource
    requireResourceAccess(request, 'finance');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const accountsPayable = await prisma.accountsPayable.findMany({
      where,
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(accountsPayable);
  } catch (error: any) {
    console.error('AP GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/financial/ap - Create new payable
export async function POST(request: NextRequest) {
  try {
    // Require permission to create finance entries
    const user = requirePermission(request, 'finance', 'create');
    
    const body = await request.json();
    const { vendor, description, amount, dueDate } = body;

    if (!vendor || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'vendor, amount, and dueDate are required' },
        { status: 400 }
      );
    }

    const accountPayable = await prisma.accountsPayable.create({
      data: {
        vendor,
        description,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        status: 'open',
      },
    });

    // Log creation in audit log
    await logCRUD(
      user.userId,
      user.email,
      'create',
      'finance',
      accountPayable.id,
      { before: null, after: accountPayable },
      request
    );

    return NextResponse.json(accountPayable);
  } catch (error: any) {
    console.error('AP POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
