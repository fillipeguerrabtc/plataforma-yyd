import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get('productId');

    const where = productId ? { productId } : {};

    const extras = await prisma.productOption.findMany({
      where,
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
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ extras });
  } catch (error: any) {
    console.error('❌ Error fetching extras:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      nameEn,
      namePt,
      nameEs,
      descriptionEn,
      descriptionPt,
      descriptionEs,
      sortOrder,
      active,
    } = body;

    if (!productId || !nameEn || !namePt || !nameEs) {
      return NextResponse.json(
        { error: 'productId, nameEn, namePt e nameEs são obrigatórios' },
        { status: 400 }
      );
    }

    const extra = await prisma.productOption.create({
      data: {
        productId,
        nameEn,
        namePt,
        nameEs,
        descriptionEn: descriptionEn || '',
        descriptionPt: descriptionPt || '',
        descriptionEs: descriptionEs || '',
        sortOrder: sortOrder || 0,
        active: active !== undefined ? active : true,
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

    console.log(`✅ Extra created: ${extra.nameEn}`);

    return NextResponse.json({ extra }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating extra:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
