import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { logAuth } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Try to find user in User table first
    let user = await prisma.user.findUnique({
      where: { email },
    });

    let userType: 'user' | 'guide' = 'user';
    let passwordHash: string | null = null;
    let userId: string = '';
    let userName: string = '';
    let userRole: string = '';
    let isActive: boolean = false;

    if (user) {
      userId = user.id;
      userName = user.name;
      userRole = user.role;
      passwordHash = user.passwordHash;
      isActive = user.active;
      userType = 'user';
    } else {
      // Try to find in Guide table
      const guide = await prisma.guide.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          active: true,
        },
      });

      if (guide && guide.passwordHash) {
        userId = guide.id;
        userName = guide.name;
        userRole = 'guide' as any;
        passwordHash = guide.passwordHash;
        isActive = guide.active;
        userType = 'guide';
      }
    }

    if (!passwordHash || !isActive) {
      // Log failed login attempt
      await logAuth('LOGIN_FAILED', email, request);
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, passwordHash);

    if (!isValidPassword) {
      // Log failed login attempt
      await logAuth('LOGIN_FAILED', email, request);
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Log successful login
    await logAuth('LOGIN', email, request);

    // Generate JWT token with userType
    const token = generateToken({
      userId: userId,
      email: email,
      role: userRole,
      userType: userType,
    });

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: email,
        name: userName,
        role: userRole,
        userType: userType,
      },
      token,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/', // CRITICAL: Cookie must be available on all routes
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
