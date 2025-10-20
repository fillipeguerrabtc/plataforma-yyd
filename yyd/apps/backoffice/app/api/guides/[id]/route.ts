import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess, requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require access to guides resource
    const user = requireResourceAccess(request, 'guides');
    
    // TODO: Ownership check - guides can only see their own profile
    // if (user.role === 'guide' && user.userId !== params.id) {
    //   throw new Error('Forbidden: You can only view your own profile');
    // }

    const guide = await prisma.guide.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          take: 10,
          orderBy: { date: 'desc' },
          include: { product: true, customer: true },
        },
      },
    });

    if (!guide) {
      return NextResponse.json({ error: 'Guia não encontrado' }, { status: 404 });
    }

    return NextResponse.json(guide);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require permission to update guides
    const user = requirePermission(request, 'guides', 'update');
    const body = await request.json();

    // Get before state for audit log
    const before = await prisma.guide.findUnique({ where: { id: params.id } });

    const guide = await prisma.guide.update({
      where: { id: params.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        languages: body.languages,
        bio: body.bio,
        photoUrl: body.photoUrl,
        certifications: body.certifications,
        active: body.active,
      },
    });

    // Log update in audit log
    await logCRUD(
      user.userId,
      user.email,
      'update',
      'guides',
      guide.id,
      { before, after: guide },
      request
    );

    return NextResponse.json(guide);
  } catch (error: any) {
    console.error('Guide update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require permission to delete guides
    const user = requirePermission(request, 'guides', 'delete');

    // Get before state for audit log
    const before = await prisma.guide.findUnique({ where: { id: params.id } });

    await prisma.guide.delete({
      where: { id: params.id },
    });

    // Log deletion in audit log
    await logCRUD(
      user.userId,
      user.email,
      'delete',
      'guides',
      params.id,
      { before, after: null },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Guide delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
