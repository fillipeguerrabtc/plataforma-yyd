import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess, requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireResourceAccess(request, 'fleet');

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'fleet', 'update');
    const body = await request.json();

    const before = await prisma.vehicle.findUnique({ where: { id: params.id } });

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.vehicleType !== undefined) updateData.vehicleType = body.vehicleType || null;
    if (body.brand !== undefined) updateData.brand = body.brand || null;
    if (body.model !== undefined) updateData.model = body.model || null;
    if (body.year !== undefined) updateData.year = body.year ? parseInt(body.year) : null;
    if (body.licensePlate !== undefined) updateData.licensePlate = body.licensePlate || null;
    if (body.color !== undefined) updateData.color = body.color || null;
    if (body.seats !== undefined) updateData.seats = body.seats ? parseInt(body.seats) : null;
    if (body.value !== undefined) updateData.value = body.value ? parseFloat(body.value) : null;
    if (body.ownershipType !== undefined) updateData.ownershipType = body.ownershipType || 'owned';
    if (body.partnerName !== undefined) updateData.partnerName = body.partnerName || null;
    if (body.partnerContact !== undefined) updateData.partnerContact = body.partnerContact || null;
    if (body.status !== undefined) updateData.status = body.status || 'active';
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl || null;
    if (body.additionalPhotos !== undefined) updateData.additionalPhotos = body.additionalPhotos || [];
    if (body.lastMaintenance !== undefined) updateData.lastMaintenance = body.lastMaintenance ? new Date(body.lastMaintenance) : null;
    if (body.nextMaintenance !== undefined) updateData.nextMaintenance = body.nextMaintenance ? new Date(body.nextMaintenance) : null;

    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: updateData,
    });

    await logCRUD(
      user.userId,
      user.email,
      'update',
      'fleet',
      vehicle.id,
      { before, after: vehicle },
      request
    );

    return NextResponse.json(vehicle);
  } catch (error: any) {
    console.error('Fleet update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(request, 'fleet', 'delete');

    const before = await prisma.vehicle.findUnique({ where: { id: params.id } });

    await prisma.vehicle.delete({
      where: { id: params.id },
    });

    await logCRUD(
      user.userId,
      user.email,
      'delete',
      'fleet',
      params.id,
      { before, after: null },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Fleet delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
