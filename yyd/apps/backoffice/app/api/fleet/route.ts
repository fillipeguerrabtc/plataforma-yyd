import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess, requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    // Require access to fleet resource
    requireResourceAccess(request, 'fleet');

    const fleet = await prisma.fleet.findMany({
      orderBy: { licensePlate: 'asc' },
    });

    return NextResponse.json(fleet);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require permission to create fleet vehicles
    const user = requirePermission(request, 'fleet', 'create');
    const body = await request.json();

    const vehicle = await prisma.fleet.create({
      data: {
        vehicleType: body.vehicleType,
        licensePlate: body.licensePlate,
        model: body.model,
        year: body.year,
        color: body.color || null,
        capacity: body.capacity || 6,
        batteryCapacity: body.batteryCapacity || null,
        batteryHealth: body.batteryHealth || null,
        lastMaintenanceAt: body.lastMaintenanceAt ? new Date(body.lastMaintenanceAt) : null,
        nextMaintenanceAt: body.nextMaintenanceAt ? new Date(body.nextMaintenanceAt) : null,
        mileage: body.mileage || 0,
        insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : null,
        status: body.status || 'active',
        notes: body.notes || null,
        imageUrl: body.imageUrl || null,
        active: body.active !== undefined ? body.active : true,
      },
    });

    // Log creation in audit log
    await logCRUD(
      user.userId,
      user.email,
      'create',
      'fleet',
      vehicle.id,
      { before: null, after: vehicle },
      request
    );

    return NextResponse.json(vehicle);
  } catch (error: any) {
    console.error('Fleet create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
