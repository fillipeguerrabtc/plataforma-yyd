import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';
import { tourSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    // Require permission to create products
    const user = requirePermission(request, 'products', 'create');
    
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

    // Log creation in audit log
    await logCRUD(
      user.userId,
      user.email,
      'create',
      'products',
      tour.id,
      { before: null, after: tour },
      request
    );

    return NextResponse.json({ success: true, tour });
  } catch (error: any) {
    console.error('Error creating tour:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
