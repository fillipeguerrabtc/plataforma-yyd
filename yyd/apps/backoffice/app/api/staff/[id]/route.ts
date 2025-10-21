import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    
    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: {
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
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
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
