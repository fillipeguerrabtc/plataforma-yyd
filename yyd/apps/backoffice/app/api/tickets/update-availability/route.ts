import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, provider, status, raw } = body;

    await prisma.ticketAvailability.create({
      data: {
        productId,
        provider,
        date: new Date(),
        status,
        raw
      }
    });

    console.log(`🎫 Ticket availability updated: ${provider} - ${status}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update availability error:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}
