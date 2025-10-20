import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Require access to analytics resource
    requireResourceAccess(request, 'analytics');
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      todayBookings,
      totalCustomers,
      totalRevenue,
      last30DaysRevenue,
      activeGuides,
      activeVehicles,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'confirmed' } }),
      prisma.booking.count({ where: { status: 'pending' } }),
      prisma.booking.count({ where: { status: 'cancelled' } }),
      prisma.booking.count({
        where: {
          date: { gte: today, lt: tomorrow },
          status: { in: ['confirmed', 'pending'] },
        },
      }),
      prisma.customer.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'succeeded' },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'succeeded',
          paidAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.guide.count({ where: { active: true } }),
      prisma.fleet.count({ where: { active: true } }),
    ]);

    return NextResponse.json({
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings,
        today: todayBookings,
      },
      revenue: {
        total: parseFloat(totalRevenue._sum.amount?.toString() || '0'),
        last30Days: parseFloat(last30DaysRevenue._sum.amount?.toString() || '0'),
      },
      customers: {
        total: totalCustomers,
      },
      resources: {
        activeGuides,
        activeVehicles,
      },
    });
  } catch (error: any) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
