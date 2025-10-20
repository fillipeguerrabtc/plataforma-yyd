import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/financial/ar - List accounts receivable
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const accountsReceivable = await prisma.accountsReceivable.findMany({
      where,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(accountsReceivable);
  } catch (error: any) {
    console.error('AR GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/financial/ar - Create new receivable
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, description, amount, dueDate } = body;

    if (!customerId || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'customerId, amount, and dueDate are required' },
        { status: 400 }
      );
    }

    const accountReceivable = await prisma.accountsReceivable.create({
      data: {
        customerId,
        description,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        status: 'open',
      },
    });

    return NextResponse.json(accountReceivable);
  } catch (error: any) {
    console.error('AR POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
