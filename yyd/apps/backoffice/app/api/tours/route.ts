import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { tourSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    // Require admin or director role
    requireAuth(request, ['admin', 'director']);
    
    const rawData = await request.json();
    
    // Validate with Zod
    const validationResult = tourSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;

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
