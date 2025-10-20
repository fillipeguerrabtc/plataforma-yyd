import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request, ['admin', 'director']);
    const body = await request.json();

    const { status, responseText } = body;

    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        status,
        publishedAt: status === 'published' ? new Date() : null,
        moderatedBy: user.userId,
        responseText: responseText || null,
        respondedAt: responseText ? new Date() : null,
        respondedBy: responseText ? user.userId : null,
      },
    });

    return NextResponse.json(review);
  } catch (error: any) {
    console.error('Review moderate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
