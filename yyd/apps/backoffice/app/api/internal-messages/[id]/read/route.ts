import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const message = await prisma.internalMessage.findUnique({
      where: { id: params.id },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const readBy = message.readBy || [];
    if (!readBy.includes(userId)) {
      readBy.push(userId);
    }

    const updatedMessage = await prisma.internalMessage.update({
      where: { id: params.id },
      data: {
        readBy,
        readAt: new Date(),
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error: any) {
    console.error('Error marking message as read:', error);
    return NextResponse.json({ error: error.message || 'Failed to mark message as read' }, { status: 500 });
  }
}
