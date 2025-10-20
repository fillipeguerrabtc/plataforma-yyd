/**
 * Customer Bookings API - Protected
 * 
 * GET /api/customer/bookings - Retorna bookings do cliente autenticado
 * Headers: Authorization: Bearer <token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET) {
  throw new Error('Server configuration error: JWT secret not configured');
}

// Verify JWT token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    // JWT_SECRET is guaranteed to exist due to throw above
    const decoded = jwt.verify(token, JWT_SECRET!) as any;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar token
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const customerId = decoded.customerId;

    // Buscar bookings do cliente
    const bookings = await prisma.booking.findMany({
      where: {
        customerId,
      },
      include: {
        product: true,
        guide: true,
        payments: true,
        selectedAddons: {
          include: {
            addon: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Separar upcoming vs past
    const now = new Date();
    const upcoming = bookings.filter(b => new Date(b.date) >= now);
    const past = bookings.filter(b => new Date(b.date) < now);

    // Transform para camelCase com decimal conversion
    const transformBooking = (b: any) => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      date: b.date,
      startTime: b.startTime,
      numberOfPeople: b.numberOfPeople,
      status: b.status,
      priceEur: Number(b.priceEur),
      addonsTotal: Number(b.addonsTotal),
      currency: b.currency,
      locale: b.locale,
      pickupLocation: b.pickupLocation,
      dropoffLocation: b.dropoffLocation,
      specialRequests: b.specialRequests,
      product: {
        id: b.product.id,
        nameEn: b.product.nameEn,
        namePt: b.product.namePt,
        nameEs: b.product.nameEs,
        tourType: b.product.tourType,
        durationHours: b.product.durationHours,
        imageUrl: b.product.imageUrl,
      },
      guide: b.guide ? {
        id: b.guide.id,
        name: b.guide.name,
        phone: b.guide.phone,
      } : null,
      addons: b.selectedAddons.map((sa: any) => ({
        quantity: sa.quantity,
        priceEur: Number(sa.priceEur),
        addon: {
          code: sa.addon.code,
          nameEn: sa.addon.nameEn,
          namePt: sa.addon.namePt,
          nameEs: sa.addon.nameEs,
          category: sa.addon.category,
        },
      })),
      payments: b.payments.map((p: any) => ({
        id: p.id,
        status: p.status,
        amountEur: Number(p.amountEur),
        method: p.method,
        paidAt: p.paidAt,
      })),
      createdAt: b.createdAt,
      confirmedAt: b.confirmedAt,
      completedAt: b.completedAt,
    });

    return NextResponse.json({
      success: true,
      upcoming: upcoming.map(transformBooking),
      past: past.map(transformBooking),
      totalBookings: bookings.length,
    });

  } catch (error) {
    console.error('❌ Customer bookings API error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar reservas' },
      { status: 500 }
    );
  }
}
