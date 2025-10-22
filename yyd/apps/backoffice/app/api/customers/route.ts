import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    requirePermission(request, 'customers', 'read');

    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        bookings: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requirePermission(request, 'customers', 'create');
    const body = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { email: body.email },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Cliente com este email já existe' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        country: body.country || null,
        locale: body.locale || 'en',
        photoUrl: body.photoUrl || null,
        notes: body.notes || null,
        totalBookings: 0,
        totalSpent: 0,
      },
    });

    await logCRUD(
      user.userId,
      user.email,
      'create',
      'customers',
      customer.id,
      { before: null, after: customer },
      request
    );

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Customer create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
