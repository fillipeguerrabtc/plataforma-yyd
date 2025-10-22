import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    requireResourceAccess(request, 'analytics');
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

    // Revenue by product
    const bookingsWithPayments = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'confirmed',
      },
      include: {
        product: {
          select: {
            titlePt: true,
            slug: true,
          },
        },
      },
    });

    const revenueByProduct: Record<string, { total: number; count: number; name: string }> = {};
    
    bookingsWithPayments.forEach((booking) => {
      const slug = booking.product.slug;
      const amount = parseFloat(booking.priceEur.toString());
      
      if (!revenueByProduct[slug]) {
        revenueByProduct[slug] = {
          name: booking.product.titlePt,
          total: 0,
          count: 0,
        };
      }
      
      revenueByProduct[slug].total += amount;
      revenueByProduct[slug].count += 1;
    });

    // Total stats
    const totalRevenue = Object.values(revenueByDay).reduce((sum, val) => sum + val, 0);
    const totalBookings = bookingsWithPayments.length;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Format for charts
    const dailyData = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue,
      bookings: bookingsWithPayments.filter(
        (b) => b.createdAt.toISOString().split('T')[0] === date
      ).length,
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
