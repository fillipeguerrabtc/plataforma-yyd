import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Require admin or director role
    requireAuth(request, ['admin', 'director']);
    
    const data = await request.json();

    const tour = await prisma.product.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, tour });
  } catch (error: any) {
    console.error('Error creating tour:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
