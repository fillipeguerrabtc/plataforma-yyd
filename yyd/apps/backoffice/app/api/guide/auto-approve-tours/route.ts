import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Find bookings pending approval for more than 1 hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.setHours() - 1);

    const pendingBookings = await prisma.booking.findMany({
      where: {
        guideApprovalStatus: 'pending',
        createdAt: { lte: oneHourAgo },
        guideId: { not: null },
      },
    });

    // Auto-approve them
    const results = await Promise.all(
      pendingBookings.map(booking =>
        prisma.booking.update({
          where: { id: booking.id },
          data: {
            guideApprovalStatus: 'approved',
            guideApprovedAt: new Date(),
            guideObservations: 'Aprovado automaticamente após 1 hora sem resposta',
          },
        })
      )
    );

    console.log(`✅ Auto-approved ${results.length} bookings`);

    return NextResponse.json({
      success: true,
      autoApproved: results.length,
    });
  } catch (error: any) {
    console.error('Failed to auto-approve tours:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
