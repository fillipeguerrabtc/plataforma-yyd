import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { logAuth } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    // Get user info before logging out (for audit log)
    const user = getUserFromRequest(request);
    
    if (user) {
      // Log logout event
      await logAuth('LOGOUT', user.email, request);
    }
  } catch (error) {
    // Don't fail logout if audit logging fails
    console.error('Logout audit log failed:', error);
  }

  const response = NextResponse.json({ success: true });
  
  // CRITICAL: Overwrite cookie with empty value and ALL original attributes to ensure browser deletes it
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
