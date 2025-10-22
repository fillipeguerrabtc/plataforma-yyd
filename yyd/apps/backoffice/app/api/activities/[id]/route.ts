import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const activity = await prisma.productActivity.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            titleEn: true,
            titlePt: true,
            titleEs: true,
            slug: true,
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ activity });
  } catch (error: any) {
    console.error('❌ Error fetching activity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const activity = await prisma.productActivity.update({
      where: { id },
      data: {
        ...body,
        priceEur: body.priceEur ? parseFloat(body.priceEur) : null,
      },
      include: {
        product: {
          select: {
            id: true,
            titleEn: true,
            titlePt: true,
            titleEs: true,
          },
        },
      },
    });

    console.log(`✅ Activity updated: ${activity.nameEn}`);

    return NextResponse.json({ activity });
  } catch (error: any) {
    console.error('❌ Error updating activity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.productActivity.delete({
      where: { id },
    });

    console.log(`✅ Activity deleted: ${id}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting activity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
