import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'reviews', 'update');
    const body = await request.json();

    const { status, responseText } = body;

    const before = await prisma.review.findUnique({ where: { id: params.id } });

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

    await logCRUD(user.userId, user.email, 'update', 'reviews', review.id, { before, after: review }, request);

    return NextResponse.json(review);
  } catch (error: any) {
    console.error('Review moderate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
