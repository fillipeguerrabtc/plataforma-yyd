import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess, requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    // Require access to bookings resource
    requireResourceAccess(request, 'bookings');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const guideId = searchParams.get('guideId');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.date = {
        gte: targetDate,
        lt: nextDay,
      };
    }

    if (guideId) {
      where.guideId = guideId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        product: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titlePt: true,
            titleEs: true,
          },
        },
        guide: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            paidAt: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Backoffice bookings API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Require permission to update bookings
    const user = requirePermission(request, 'bookings', 'update');
    const body = await request.json();
    const { bookingId, status, guideId, vehicleId, notes } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID obrigatório' }, { status: 400 });
    }

    const updateData: any = {};
    
    if (status) updateData.status = status;
    if (guideId !== undefined) updateData.guideId = guideId;
    if (vehicleId !== undefined) updateData.vehicleId = vehicleId;
    if (notes !== undefined) updateData.specialRequests = notes;

    // Get before state for audit log
    const before = await prisma.booking.findUnique({ where: { id: bookingId } });

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        customer: true,
        product: true,
        guide: true,
      },
    });

    // Log update in audit log
    await logCRUD(
      user.userId,
      user.email,
      'update',
      'bookings',
      booking.id,
      { before, after: booking },
      request
    );

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('Backoffice booking update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
