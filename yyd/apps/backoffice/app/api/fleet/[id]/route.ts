import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request, ['admin', 'director']);

    const vehicle = await prisma.fleet.findUnique({
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
    const user = requireAuth(request, ['admin', 'director']);
    const body = await request.json();

    const vehicle = await prisma.fleet.update({
      where: { id: params.id },
      data: {
        vehicleType: body.vehicleType,
        licensePlate: body.licensePlate,
        model: body.model,
        year: body.year,
        color: body.color,
        capacity: body.capacity,
        batteryCapacity: body.batteryCapacity,
        batteryHealth: body.batteryHealth,
        lastMaintenanceAt: body.lastMaintenanceAt ? new Date(body.lastMaintenanceAt) : null,
        nextMaintenanceAt: body.nextMaintenanceAt ? new Date(body.nextMaintenanceAt) : null,
        mileage: body.mileage,
        insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
        status: body.status,
        notes: body.notes,
        imageUrl: body.imageUrl,
        active: body.active,
      },
    });

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
    const user = requireAuth(request, ['admin']);

    await prisma.fleet.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Fleet delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
