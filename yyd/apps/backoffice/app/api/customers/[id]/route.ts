import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess, requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireResourceAccess(request, 'customers');

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'customers', 'update');
    const body = await request.json();

    const before = await prisma.customer.findUnique({ where: { id: params.id } });

    if (!before) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone || null;
    if (body.country !== undefined) updateData.country = body.country || null;
    if (body.locale !== undefined) updateData.locale = body.locale;
    if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl || null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;

    if (body.email && body.email !== before.email) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: body.email },
      });
      if (existingCustomer) {
        return NextResponse.json(
          { error: 'Email já está em uso por outro cliente' },
          { status: 400 }
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: updateData,
    });

    await logCRUD(
      user.userId,
      user.email,
      'update',
      'customers',
      customer.id,
      { before, after: customer },
      request
    );

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Customer update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'customers', 'delete');

    const before = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        bookings: true,
      },
    });

    if (!before) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    if (before.bookings && before.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir cliente com reservas existentes' },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    await logCRUD(
      user.userId,
      user.email,
      'delete',
      'customers',
      params.id,
      { before, after: null },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Customer delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
