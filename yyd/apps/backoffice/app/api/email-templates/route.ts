import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    requirePermission(request, 'settings', 'read');

    const templates = await prisma.emailTemplate.findMany({
      orderBy: { category: 'asc' },
    });

    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requirePermission(request, 'settings', 'create');
    const body = await request.json();

    const {
      name,
      templateKey,
      subjectEn,
      subjectPt,
      subjectEs,
      bodyEn,
      bodyPt,
      bodyEs,
      category,
      variables,
      enabled,
    } = body;

    if (!name || !templateKey || !subjectEn || !bodyEn) {
      return NextResponse.json(
        { error: 'name, templateKey, subjectEn, and bodyEn are required' },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        templateKey,
        subjectEn,
        subjectPt: subjectPt || subjectEn,
        subjectEs: subjectEs || subjectEn,
        bodyEn,
        bodyPt: bodyPt || bodyEn,
        bodyEs: bodyEs || bodyEn,
        category: category || 'general',
        variables: variables || [],
        enabled: enabled !== undefined ? enabled : true,
      },
    });

    await logCRUD(user.userId, user.email, 'create', 'email_template', template.id, { after: template }, request);

    return NextResponse.json(template);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
