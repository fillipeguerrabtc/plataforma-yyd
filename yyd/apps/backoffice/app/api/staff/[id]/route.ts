import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    
    const updateData: any = {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      position: body.position,
      department: body.department,
      hireDate: body.hireDate ? new Date(body.hireDate) : undefined,
      salary: body.salary ? parseFloat(body.salary) : null,
      salaryCurrency: body.salaryCurrency,
      contractType: body.contractType,
      status: body.status,
      photoUrl: body.photoUrl || null,
      bio: body.bio || null,
      role: body.role,
      canAccessModules: body.canAccessModules || [],
      accessLevel: body.accessLevel,
      notes: body.notes || null,
    };

    if (body.password) {
      updateData.passwordHash = await bcrypt.hash(body.password, 10);
    }
    
    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(staff);
  } catch (error: any) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: error.message || 'Failed to update staff member' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.staff.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 });
  }
}
