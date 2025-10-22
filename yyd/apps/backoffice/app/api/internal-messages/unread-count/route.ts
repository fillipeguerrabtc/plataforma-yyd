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

    const userDepts = await getUserDepartments(userId, userRole);

    const count = await prisma.internalMessage.count({
      where: {
        AND: [
          {
            OR: [
              { recipientIds: { has: userId } },
              {
                AND: [
                  { recipientType: 'department' },
                  { departmentTarget: { in: userDepts } },
                ],
              },
            ],
          },
          {
            NOT: {
              readBy: { has: userId },
            },
          },
          {
            NOT: {
              senderId: userId,
            },
          },
        ],
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 });
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
