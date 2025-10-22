import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.userId;
    const userRole = user.role;

    const message = await prisma.internalMessage.findUnique({
      where: { id: params.id },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const isDirectRecipient = message.recipientIds.includes(userId);

    let isDepartmentRecipient = false;
    if (message.recipientType === 'department' && message.departmentTarget) {
      const userDepts = await getUserDepartments(userId, userRole);
      isDepartmentRecipient = userDepts.includes(message.departmentTarget);
    }

    if (!isDirectRecipient && !isDepartmentRecipient) {
      return NextResponse.json({ error: 'Forbidden: Not a recipient of this message' }, { status: 403 });
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
