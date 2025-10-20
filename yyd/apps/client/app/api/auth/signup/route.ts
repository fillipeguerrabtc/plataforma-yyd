import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateCustomerToken } from '@/lib/customer-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, whatsapp, locale } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      const existingAuth = await prisma.customerAuth.findUnique({
        where: { customerId: existingCustomer.id },
      });

      if (existingAuth) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create customer if doesn't exist
    let customer = existingCustomer;
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name,
          email,
          phone: phone || null,
          whatsapp: whatsapp || phone || null,
          locale: locale || 'en',
          source: 'direct_signup',
        },
      });
    }

    // Create auth record
    const auth = await prisma.customerAuth.create({
      data: {
        customerId: customer.id,
        email: customer.email,
        passwordHash,
        verified: false, // TODO: Send verification email
      },
    });

    // Generate JWT token
    const token = generateCustomerToken({
      customerId: customer.id,
      email: customer.email,
    });

    // Return response with token in cookie
    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
      token,
    });

    response.cookies.set('customer-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar conta' },
      { status: 500 }
    );
  }
}
