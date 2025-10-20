import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireResourceAccess(request, 'customers');

    const bookings = await prisma.booking.findMany({
      where: { customerId: params.id },
      include: {
        product: { select: { titlePt: true } },
        guide: { select: { name: true } },
        payments: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const messages = await prisma.message.findMany({
      where: { customerId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const timeline = [
      ...bookings.map((b) => ({
        type: 'booking',
        date: b.createdAt,
        data: b,
      })),
      ...messages.map((m) => ({
        type: 'message',
        date: m.createdAt,
        data: m,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return NextResponse.json(timeline);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
