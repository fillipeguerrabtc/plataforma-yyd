import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin or director role
    requireAuth(request, ['admin', 'director']);
    
    const data = await request.json();

    const tour = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, tour });
  } catch (error: any) {
    console.error('Error updating tour:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin role only
    requireAuth(request, ['admin']);
    
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting tour:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
