import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'userId and userRole are required' }, { status: 400 });
    }

    const messages = await prisma.internalMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientIds: { has: userId } },
          {
            AND: [
              { recipientType: 'department' },
              {
                departmentTarget: {
                  in: await getUserDepartments(userId, userRole),
                },
              },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.senderId || !body.senderName || !body.senderRole) {
      return NextResponse.json({ error: 'Sender information is required' }, { status: 400 });
    }

    if (!body.content || !body.content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const message = await prisma.internalMessage.create({
      data: {
        senderId: body.senderId,
        senderName: body.senderName,
        senderRole: body.senderRole,
        recipientType: body.recipientType || 'individual',
        recipientIds: body.recipientIds || [],
        departmentTarget: body.departmentTarget || null,
        subject: body.subject || null,
        content: body.content,
        metadata: body.metadata || null,
      },
    });

    console.log(`✅ Message sent from ${body.senderName} to ${body.recipientType}`);

    return NextResponse.json(message);
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
  }
}

async function getUserDepartments(userId: string, userRole: string): Promise<string[]> {
  try {
    if (userRole === 'guide') {
      const guide = await prisma.guide.findUnique({
        where: { id: userId },
        select: { departmentId: true },
      });
      return guide?.departmentId ? [guide.departmentId] : [];
    }

    const staff = await prisma.staff.findUnique({
      where: { id: userId },
      select: { departmentId: true },
    });
    return staff?.departmentId ? [staff.departmentId] : [];
  } catch (error) {
    return [];
  }
}
