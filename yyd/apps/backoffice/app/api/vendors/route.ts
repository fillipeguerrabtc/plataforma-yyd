import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const vendor = await prisma.vendor.create({
      data: {
        name: body.name,
        companyName: body.companyName || null,
        email: body.email,
        phone: body.phone || null,
        address: body.address || null,
        taxId: body.taxId || null,
        category: body.category,
        bankAccount: body.bankAccount || null,
        paymentTerms: body.paymentTerms || null,
        notes: body.notes || null,
        status: body.status || 'active',
        currency: body.currency || 'EUR',
      },
    });

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}
