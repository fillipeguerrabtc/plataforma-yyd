import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireCustomerAuth } from '@/lib/customer-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = requireCustomerAuth(request);

    const customer = await prisma.customer.findUnique({
      where: { id: auth.customerId },
      include: {
        bookings: {
          take: 5,
          orderBy: { date: 'desc' },
          include: { product: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      whatsapp: customer.whatsapp,
      locale: customer.locale,
      totalBookings: customer.totalBookings,
      totalSpent: customer.totalSpent,
      recentBookings: customer.bookings,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    console.error('Me endpoint error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
