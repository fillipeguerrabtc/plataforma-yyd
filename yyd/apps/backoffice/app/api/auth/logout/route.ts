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
  
  // CRITICAL: Use cookies.delete() with exact same path as login to properly remove the httpOnly cookie
  response.cookies.delete('auth-token', { path: '/' });

  return response;
}
