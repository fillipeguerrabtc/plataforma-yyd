import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get('productId');

    const where = productId ? { productId } : {};

    const activities = await prisma.productActivity.findMany({
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

    return NextResponse.json({ activities });
  } catch (error: any) {
    console.error('❌ Error fetching activities:', error);
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
      imageUrl,
      type,
      priceEur,
      includedInAllInclusive,
      sortOrder,
      active,
    } = body;

    if (!productId || !nameEn || !namePt || !nameEs) {
      return NextResponse.json(
        { error: 'productId, nameEn, namePt e nameEs são obrigatórios' },
        { status: 400 }
      );
    }

    const activity = await prisma.productActivity.create({
      data: {
        productId,
        nameEn,
        namePt,
        nameEs,
        descriptionEn: descriptionEn || '',
        descriptionPt: descriptionPt || '',
        descriptionEs: descriptionEs || '',
        imageUrl,
        type: type || 'activity',
        priceEur: priceEur ? parseFloat(priceEur) : null,
        includedInAllInclusive: includedInAllInclusive || false,
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

    console.log(`✅ Activity created: ${activity.nameEn}`);

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating activity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
