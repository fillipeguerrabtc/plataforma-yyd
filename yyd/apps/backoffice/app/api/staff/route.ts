import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requirePermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    requirePermission(req, 'staff', 'read');
    
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with Stripe status metadata
    const enrichedStaff = staff.map((member) => ({
      ...member,
      hasStripeAccount: !!member.stripeConnectedAccountId,
      stripeStatus: member.stripeConnectedAccountId 
        ? (member.stripeAccountStatus || 'unknown')
        : 'not_configured',
    }));

    return NextResponse.json(enrichedStaff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requirePermission(req, 'staff', 'create');
    
    const body = await req.json();

    if (!body.password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    // Create staff member
    const staff = await prisma.staff.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        position: body.position,
        departmentId: body.departmentId || null,
        hireDate: new Date(body.hireDate),
        salary: body.salary ? parseFloat(body.salary) : null,
        salaryCurrency: body.salaryCurrency || 'EUR',
        contractType: body.contractType || 'full-time',
        status: body.status || 'active',
        photoUrl: body.photoUrl || null,
        bio: body.bio || null,
        role: body.role || 'support',
        canAccessModules: body.canAccessModules || [],
        accessLevel: body.accessLevel || 'read',
        notes: body.notes || null,
        passwordHash: hashedPassword,
        stripeConnectedAccountId: body.stripeConnectedAccountId || null,
      },
    });

    // Also create User for authentication
    await prisma.user.upsert({
      where: { email: body.email },
      create: {
        email: body.email,
        name: body.name,
        passwordHash: hashedPassword,
        role: body.role || 'support',
        active: body.status === 'active',
        stripeConnectedAccountId: body.stripeConnectedAccountId || null,
      },
      update: {
        name: body.name,
        passwordHash: hashedPassword,
        role: body.role || 'support',
        active: body.status === 'active',
        stripeConnectedAccountId: body.stripeConnectedAccountId || null,
      },
    });

    console.log(`✅ Created staff and user for: ${body.email}`);

    return NextResponse.json(staff);
  } catch (error: any) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: error.message || 'Failed to create staff member' }, { status: 500 });
  }
}
