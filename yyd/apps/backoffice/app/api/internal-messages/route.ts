import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.userId;
    const userRole = user.role;

    const userDepts = await getUserDepartments(userId, userRole);

    const messages = await prisma.internalMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientIds: { has: userId } },
          {
            AND: [
              { recipientType: 'department' },
              { departmentTarget: { in: userDepts } },
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
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.content || !body.content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    if (body.recipientType === 'department' && body.departmentTarget) {
      const userDepts = await getUserDepartments(user.userId, user.role);
      if (!userDepts.includes(body.departmentTarget)) {
        return NextResponse.json(
          { error: 'Forbidden: You can only send department broadcasts to your own department' },
          { status: 403 }
        );
      }
    }

    const senderName = await getSenderName(user.userId, user.role);

    const message = await prisma.internalMessage.create({
      data: {
        senderId: user.userId,
        senderName,
        senderRole: user.role,
        recipientType: body.recipientType || 'individual',
        recipientIds: body.recipientIds || [],
        departmentTarget: body.departmentTarget || null,
        subject: body.subject || null,
        content: body.content,
        metadata: body.metadata || null,
      },
    });

    console.log(`✅ Message sent from ${senderName} (${user.role}) to ${body.recipientType}`);

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

    if (userRole === 'staff' || userRole === 'manager' || userRole === 'admin') {
      const staff = await prisma.staff.findUnique({
        where: { id: userId },
        select: { departmentId: true },
      });
      return staff?.departmentId ? [staff.departmentId] : [];
    }

    return [];
  } catch (error) {
    return [];
  }
}

async function getSenderName(userId: string, userRole: string): Promise<string> {
  try {
    if (userRole === 'guide') {
      const guide = await prisma.guide.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      return guide?.name || 'Unknown Guide';
    }

    const staff = await prisma.staff.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    return staff?.name || 'Unknown Staff';
  } catch (error) {
    return 'Unknown User';
  }
}
