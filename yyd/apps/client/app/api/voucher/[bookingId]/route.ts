import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVoucherPDF } from '@/lib/generateVoucher';

export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    // TODO: Add customer authentication check
    // For now, validate booking exists and is paid
    
    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: {
        product: true,
        customer: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const voucherPDF = await generateVoucherPDF({
      bookingNumber: booking.bookingNumber,
      customerName: booking.customer.name,
      customerEmail: booking.customer.email,
      tourTitle: booking.product.titleEn,
      date: booking.date,
      startTime: booking.startTime,
      numberOfPeople: booking.numberOfPeople,
      priceEur: booking.priceEur,
      specialRequests: booking.specialRequests || undefined,
    });

    return new NextResponse(voucherPDF, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="YYD-Voucher-${booking.bookingNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating voucher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
