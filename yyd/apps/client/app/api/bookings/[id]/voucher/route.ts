import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireCustomerAuth } from '@/lib/customer-auth';
import { generateVoucherPDF } from '@/lib/pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require customer authentication
    const customer = requireCustomerAuth(request);

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        product: true,
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    // Verify ownership
    if (booking.customerId !== customer.customerId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Check if booking is confirmed (paid)
    const isPaid = booking.payments.some((p) => p.status === 'succeeded');
    if (!isPaid && booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Voucher disponível apenas após pagamento' },
        { status: 400 }
      );
    }

    // Generate voucher PDF
    const pdfBuffer = await generateVoucherPDF({
      bookingNumber: booking.bookingNumber,
      customerName: booking.customer.name,
      tourTitle: booking.product.titleEn || booking.product.titlePt || booking.product.titleEs || 'Tour',
      date: booking.date,
      time: booking.startTime,
      numberOfPeople: booking.numberOfPeople,
      pickupLocation: booking.pickupLocation,
      priceEur: parseFloat(booking.priceEur.toString()),
      specialRequests: booking.specialRequests || undefined,
      qrCodeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking.id}`,
    });

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="YYD-Voucher-${booking.bookingNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    console.error('Voucher generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
