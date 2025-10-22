import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user || user.userType !== 'guide') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return minimal guide list for transfer purposes
    const guides = await prisma.guide.findMany({
      where: {
        active: true,
        id: { not: user.userId }, // Exclude self
      },
      select: {
        id: true,
        name: true,
        email: true,
        languages: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(guides);
  } catch (error: any) {
    console.error('Failed to list guides:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
