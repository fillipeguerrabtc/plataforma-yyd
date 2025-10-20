import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';
import { tourSchema } from '@/lib/validators';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Require permission to update products
    const user = requirePermission(request, 'products', 'update');
    
    const rawData = await request.json();
    
    // Validate with Zod (partial for updates)
    const validationResult = tourSchema.partial().safeParse(rawData);
    
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

    // Get before state for audit log
    const before = await prisma.product.findUnique({ where: { id: params.id } });

    const tour = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // Log update in audit log
    await logCRUD(
      user.userId,
      user.email,
      'update',
      'products',
      tour.id,
      { before, after: tour },
      request
    );

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
    // Require permission to delete products
    const user = requirePermission(request, 'products', 'delete');
    
    // Get before state for audit log
    const before = await prisma.product.findUnique({ where: { id: params.id } });
    
    await prisma.product.delete({
      where: { id: params.id },
    });

    // Log deletion in audit log
    await logCRUD(
      user.userId,
      user.email,
      'delete',
      'products',
      params.id,
      { before, after: null },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting tour:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
