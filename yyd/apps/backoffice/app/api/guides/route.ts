import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request, ['admin', 'director', 'guide']);

    const guides = await prisma.guide.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(guides);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request, ['admin', 'director']);
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

    return NextResponse.json(guide);
  } catch (error: any) {
    console.error('Guide create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
