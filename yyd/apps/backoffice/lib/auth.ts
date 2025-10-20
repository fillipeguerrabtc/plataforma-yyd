import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { UserRole, Resource, Action } from './rbac';
import { hasPermission, canAccess } from './rbac';
import { logPermissionDenied } from './audit';

// SECURITY: JWT_SECRET_KEY must be set in production
if (!process.env.JWT_SECRET_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET_KEY environment variable is required in production');
}

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'yyd-secret-2025-dev-only';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/auth-token=([^;]+)/);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

export function getUserFromRequest(request: Request): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

/**
 * Require authentication (backward compatible)
 * Use requirePermission() for fine-grained access control
 */
export function requireAuth(request: Request, allowedRoles?: UserRole[]): JWTPayload {
  const user = getUserFromRequest(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Log permission denial
    logPermissionDenied(
      user.userId,
      user.email,
      'unknown',
      `role_required: ${allowedRoles.join(',')}`,
      request
    ).catch(console.error);
    
    throw new Error('Forbidden');
  }
  
  return user;
}

/**
 * Require specific permission on a resource
 * This is the RECOMMENDED way to check permissions
 * 
 * @example
 * requirePermission(request, 'products', 'update')
 */
export function requirePermission(
  request: Request,
  resource: Resource,
  action: Action
): JWTPayload {
  const user = getUserFromRequest(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  if (!hasPermission(user.role, resource, action)) {
    // Log permission denial with details
    logPermissionDenied(
      user.userId,
      user.email,
      resource,
      action,
      request
    ).catch(console.error);
    
    throw new Error(`Forbidden: You don't have permission to ${action} ${resource}`);
  }
  
  return user;
}

/**
 * Check if user can access a resource (any action)
 */
export function requireResourceAccess(
  request: Request,
  resource: Resource
): JWTPayload {
  const user = getUserFromRequest(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  if (!canAccess(user.role, resource)) {
    logPermissionDenied(
      user.userId,
      user.email,
      resource,
      'access',
      request
    ).catch(console.error);
    
    throw new Error(`Forbidden: You don't have access to ${resource}`);
  }
  
  return user;
}
