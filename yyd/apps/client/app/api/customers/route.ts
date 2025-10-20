/**
 * Customers API - Create or Get Customer
 * POST /api/customers - Create customer or return existing
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, locale = 'en' } = await request.json();

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if customer exists
    let customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (customer) {
      // Update existing customer
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name,
          phone,
          locale,
        },
      });
    } else {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          phone,
          locale,
        },
      });
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        locale: customer.locale,
      },
    });

  } catch (error) {
    console.error('❌ Customer creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
