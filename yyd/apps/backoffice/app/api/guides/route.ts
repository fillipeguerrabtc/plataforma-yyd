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

    // Enrich with Stripe status metadata
    const enrichedGuides = guides.map((guide) => ({
      ...guide,
      hasStripeAccount: !!guide.stripeConnectedAccountId,
      stripeStatus: guide.stripeConnectedAccountId 
        ? (guide.stripeAccountStatus || 'unknown')
        : 'not_configured',
    }));

    return NextResponse.json(enrichedGuides);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require permission to create guides
    const user = requirePermission(request, 'guides', 'create');
    const body = await request.json();

    // Hash password if provided
    let passwordHash: string | undefined = undefined;
    if (body.password) {
      const bcrypt = await import('bcryptjs');
      passwordHash = await bcrypt.hash(body.password, 10);
    }

    const guide = await prisma.guide.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        passwordHash: passwordHash,
        languages: body.languages || [],
        bio: body.bio || null,
        photoUrl: body.photoUrl || null,
        certifications: body.certifications || [],
        departmentId: body.departmentId || null,
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
