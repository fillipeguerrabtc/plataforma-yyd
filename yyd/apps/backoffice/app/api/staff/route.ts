import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    const staff = await prisma.staff.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        position: body.position,
        department: body.department,
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
      },
    });

    return NextResponse.json(staff);
  } catch (error: any) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: error.message || 'Failed to create staff member' }, { status: 500 });
  }
}
