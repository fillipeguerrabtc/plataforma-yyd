/**
 * Audit Logging Service
 * 
 * Log all administrative actions for compliance and security
 */

import { prisma } from './prisma';

export interface AuditLogData {
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        userEmail: data.userEmail,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        changes: data.changes || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    // Just log to console for debugging
    console.error('❌ Audit log failed:', error);
  }
}

/**
 * Extract IP address from request
 */
export function getIpFromRequest(request: Request): string | undefined {
  // Check various headers for IP (behind proxies)
  const headers = request.headers;
  
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    undefined
  );
}

/**
 * Extract user agent from request
 */
export function getUserAgentFromRequest(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined;
}

/**
 * Helper to log CRUD operations
 * USAGE: logCRUD(userId, userEmail, operation, entityType, entityId, changes, request)
 */
export async function logCRUD(
  userId: string,
  userEmail: string,
  operation: 'create' | 'update' | 'delete',
  entityType: string,
  entityId: string,
  changes: Record<string, any> | undefined,
  request: Request
): Promise<void> {
  const action = `${operation.toUpperCase()}_${entityType.toUpperCase()}`;
  
  await createAuditLog({
    userId,
    userEmail,
    action,
    entityType,
    entityId,
    changes,
    ipAddress: getIpFromRequest(request),
    userAgent: getUserAgentFromRequest(request),
  });
}

/**
 * Helper to log authentication events
 */
export async function logAuth(
  action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED',
  userEmail: string,
  request: Request
): Promise<void> {
  await createAuditLog({
    userEmail,
    action,
    entityType: 'auth',
    ipAddress: getIpFromRequest(request),
    userAgent: getUserAgentFromRequest(request),
  });
}

/**
 * Helper to log permission denials
 */
export async function logPermissionDenied(
  userId: string | undefined,
  userEmail: string | undefined,
  resource: string,
  action: string,
  request: Request
): Promise<void> {
  await createAuditLog({
    userId,
    userEmail,
    action: 'PERMISSION_DENIED',
    entityType: resource,
    changes: { attemptedAction: action },
    ipAddress: getIpFromRequest(request),
    userAgent: getUserAgentFromRequest(request),
  });
}
