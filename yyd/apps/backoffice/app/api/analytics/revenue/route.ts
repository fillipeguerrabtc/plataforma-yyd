import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    requirePermission(request, 'analytics', 'read');
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const days = parseInt(period);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily revenue
    const payments = await prisma.payment.findMany({
      where: {
        status: 'succeeded',
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        paidAt: true,
        currency: true,
      },
      orderBy: { paidAt: 'asc' },
    });

    // Group by day
    const revenueByDay: Record<string, number> = {};
    
    payments.forEach((payment) => {
      if (!payment.paidAt) return;
      
      const day = payment.paidAt.toISOString().split('T')[0];
      const amount = parseFloat(payment.amount.toString());
      
      if (!revenueByDay[day]) {
        revenueByDay[day] = 0;
      }
      revenueByDay[day] += amount;
    });

    // Revenue by product (using actual payments filtered by paidAt, not booking createdAt)
    const paymentsWithBookings = await prisma.payment.findMany({
      where: {
        status: 'succeeded',
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        booking: {
          include: {
            product: {
              select: {
                titlePt: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    const revenueByProduct: Record<string, { total: number; count: number; name: string }> = {};
    const bookingCountByProduct: Record<string, Set<string>> = {};
    
    paymentsWithBookings.forEach((payment) => {
      if (!payment.booking) return;
      
      const slug = payment.booking.product.slug;
      const amount = parseFloat(payment.amount.toString());
      
      if (!revenueByProduct[slug]) {
        revenueByProduct[slug] = {
          name: payment.booking.product.titlePt,
          total: 0,
          count: 0,
        };
        bookingCountByProduct[slug] = new Set();
      }
      
      revenueByProduct[slug].total += amount;
      bookingCountByProduct[slug].add(payment.bookingId);
    });
    
    // Update counts with unique bookings
    Object.keys(revenueByProduct).forEach((slug) => {
      revenueByProduct[slug].count = bookingCountByProduct[slug].size;
    });

    // Total stats - based on actual payments
    const totalRevenue = Object.values(revenueByDay).reduce((sum, val) => sum + val, 0);
    const uniqueBookingIds = new Set(paymentsWithBookings.map(p => p.bookingId));
    const totalBookings = uniqueBookingIds.size;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Format for charts - group payments by date
    const dailyData = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue,
      bookings: paymentsWithBookings.filter(
        (p) => p.paidAt && p.paidAt.toISOString().split('T')[0] === date
      ).map(p => p.bookingId).filter((v, i, a) => a.indexOf(v) === i).length,
    }));

    const productData = Object.values(revenueByProduct).map((p) => ({
      productName: p.name,
      revenue: p.total,
      count: p.count,
    }));

    return NextResponse.json({
      period: days,
      totals: {
        total: totalRevenue,
        average: averageBookingValue,
        count: totalBookings,
      },
      daily: dailyData,
      byProduct: productData,
      revenueByDay,
      revenueByProduct,
    });
  } catch (error: any) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
