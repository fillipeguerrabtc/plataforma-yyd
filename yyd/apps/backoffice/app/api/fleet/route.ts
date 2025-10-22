import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth';
import { logCRUD } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    requirePermission(request, 'fleet', 'read');

    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vehicles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requirePermission(request, 'fleet', 'create');
    const body = await request.json();

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Nome do veículo é obrigatório' }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        name: body.name,
        vehicleType: body.vehicleType || null,
        brand: body.brand || null,
        model: body.model || null,
        year: body.year ? parseInt(body.year) : null,
        licensePlate: body.licensePlate || null,
        color: body.color || null,
        seats: body.seats ? parseInt(body.seats) : null,
        value: body.value ? parseFloat(body.value) : null,
        ownershipType: body.ownershipType || 'owned',
        partnerName: body.partnerName || null,
        partnerContact: body.partnerContact || null,
        status: body.status || 'active',
        notes: body.notes || null,
        photoUrl: body.photoUrl || null,
        additionalPhotos: body.additionalPhotos || [],
        lastMaintenance: body.lastMaintenance ? new Date(body.lastMaintenance) : null,
        nextMaintenance: body.nextMaintenance ? new Date(body.nextMaintenance) : null,
      },
    });

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
