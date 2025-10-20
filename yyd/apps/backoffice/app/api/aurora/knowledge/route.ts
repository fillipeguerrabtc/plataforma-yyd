import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    requirePermission(request, 'aurora', 'read');

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = {};
    if (category) where.category = category;

    const knowledge = await prisma.auroraKnowledge.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { usageCount: 'desc' }],
    });

    return NextResponse.json(knowledge);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requirePermission(request, 'aurora', 'create');
    const body = await request.json();

    const {
      category,
      questionEn,
      questionPt,
      questionEs,
      answerEn,
      answerPt,
      answerEs,
      tags,
      priority,
    } = body;

    if (!category || !questionEn || !answerEn) {
      return NextResponse.json(
        { error: 'category, questionEn, and answerEn are required' },
        { status: 400 }
      );
    }

    const knowledge = await prisma.auroraKnowledge.create({
      data: {
        category,
        questionEn,
        questionPt: questionPt || questionEn,
        questionEs: questionEs || questionEn,
        answerEn,
        answerPt: answerPt || answerEn,
        answerEs: answerEs || answerEn,
        tags: tags || [],
        priority: priority || 0,
        active: true,
      },
    });

    await logCRUD(user.userId, user.email, 'create', 'aurora_knowledge', knowledge.id, { after: knowledge }, request);

    return NextResponse.json(knowledge);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
