'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function assignGuide(bookingId: string, guideId: string) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { guideId: guideId || null },
  });

  // Update availability slot if exists
  const slot = await prisma.availabilitySlot.findFirst({
    where: { 
      productId: (await prisma.booking.findUnique({ where: { id: bookingId }, select: { productId: true } }))!.productId,
    },
  });

  if (slot) {
    await prisma.availabilitySlot.updateMany({
      where: { 
        productId: slot.productId,
      },
      data: { guideId: guideId || null },
    });
  }

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath('/bookings');
  revalidatePath('/calendar');
}

export async function updateBookingStatus(bookingId: string, status: string) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { 
      status,
      completedAt: status === 'completed' ? new Date() : null,
      cancelledAt: status === 'cancelled' ? new Date() : null,
    },
  });

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath('/bookings');
}
