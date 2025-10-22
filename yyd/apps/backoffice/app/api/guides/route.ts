import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    // Require permission to read guides
    requirePermission(request, 'guides', 'read');

    const guides = await prisma.guide.findMany({
      orderBy: { name: 'asc' },
      include: {
        bookings: {
          where: {
            date: { gte: new Date() },
            status: 'confirmed',
          },
          include: {
            product: true,
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json(guides);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require permission to create guides
    const user = requirePermission(request, 'guides', 'create');
    const body = await request.json();

    const guide = await prisma.guide.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        languages: body.languages || [],
        bio: body.bio || null,
        photoUrl: body.photoUrl || null,
        certifications: body.certifications || [],
        active: body.active !== undefined ? body.active : true,
      },
    });

    // Log creation in audit log
    await logCRUD(
      user.userId,
      user.email,
      'create',
      'guides',
      guide.id,
      { before: null, after: guide },
      request
    );

    return NextResponse.json(guide);
  } catch (error: any) {
    console.error('Guide create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
