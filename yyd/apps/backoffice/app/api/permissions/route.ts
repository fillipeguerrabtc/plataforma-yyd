import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    const resource = searchParams.get('resource');

    const where: any = { active: true };
    if (category) where.category = category;
    if (resource) where.resource = resource;

    const permissions = await prisma.permission.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
      ],
    });

    // Group by category
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return NextResponse.json({ permissions, grouped });
  } catch (error: any) {
    console.error('❌ Error fetching permissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      resource,
      action,
      labelEn,
      labelPt,
      labelEs,
      description,
      category,
      sortOrder,
      active,
    } = body;

    if (!resource || !action || !labelEn || !labelPt || !labelEs || !category) {
      return NextResponse.json(
        { error: 'resource, action, labelEn, labelPt, labelEs e category são obrigatórios' },
        { status: 400 }
      );
    }

    const permission = await prisma.permission.create({
      data: {
        resource,
        action,
        labelEn,
        labelPt,
        labelEs,
        description,
        category,
        sortOrder: sortOrder || 0,
        active: active !== undefined ? active : true,
      },
    });

    console.log(`✅ Permission created: ${resource}.${action}`);

    return NextResponse.json({ permission }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating permission:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
