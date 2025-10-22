import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const extra = await prisma.productOption.findUnique({
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

    if (!extra) {
      return NextResponse.json({ error: 'Extra not found' }, { status: 404 });
    }

    return NextResponse.json({ extra });
  } catch (error: any) {
    console.error('❌ Error fetching extra:', error);
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

    const extra = await prisma.productOption.update({
      where: { id },
      data: body,
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

    console.log(`✅ Extra updated: ${extra.nameEn}`);

    return NextResponse.json({ extra });
  } catch (error: any) {
    console.error('❌ Error updating extra:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.productOption.delete({
      where: { id },
    });

    console.log(`✅ Extra deleted: ${id}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting extra:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
