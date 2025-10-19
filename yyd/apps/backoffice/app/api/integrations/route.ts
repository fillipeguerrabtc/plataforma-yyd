import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const integrations = await prisma.integration.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(integrations);
  } catch (error) {
    console.error('Get integrations error:', error);
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kind, name, config, active = true } = body;

    const integration = await prisma.integration.create({
      data: { kind, name, config, active }
    });

    console.log(`✅ Integration created: ${kind} - ${name}`);
    return NextResponse.json(integration);
  } catch (error) {
    console.error('Create integration error:', error);
    return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 });
  }
}
