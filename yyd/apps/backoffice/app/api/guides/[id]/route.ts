import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request, ['admin', 'director', 'guide']);

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
    const user = requireAuth(request, ['admin', 'director']);
    const body = await request.json();

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
    const user = requireAuth(request, ['admin']);

    await prisma.guide.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Guide delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
