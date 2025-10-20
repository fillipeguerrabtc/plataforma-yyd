/**
 * Passwordless Customer Login - Email Only
 * 
 * Cliente digita apenas email → Sistema busca bookings → Login automático
 * Sem senha, sem cadastro prévio necessário
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// SECURITY: JWT secret MUST be set in environment
const JWT_SECRET = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET_KEY not set in environment!');
  throw new Error('Server configuration error: JWT secret not configured');
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validação básica
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();

    // Buscar customer pelo email
    const customer = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
      include: {
        bookings: {
          include: {
            product: true,
            payments: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    // Se não existe customer com esse email
    if (!customer) {
      return NextResponse.json(
        { 
          error: 'Nenhuma reserva encontrada com este email',
          message: 'Verifique se digitou o email correto ou faça sua primeira reserva'
        },
        { status: 404 }
      );
    }

    // Gerar token JWT simples (válido por 30 dias)
    // JWT_SECRET is guaranteed to exist due to throw above
    const token = jwt.sign(
      {
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
      },
      JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // Retornar token + dados básicos do cliente
    return NextResponse.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        locale: customer.locale,
        totalBookings: customer.bookings.length,
        upcomingBookings: customer.bookings.filter(
          (b: any) => new Date(b.date) >= new Date()
        ).length,
      },
    });

  } catch (error) {
    console.error('❌ Passwordless login error:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login. Tente novamente.' },
      { status: 500 }
    );
  }
}
