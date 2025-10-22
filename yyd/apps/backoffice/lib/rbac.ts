/**
 * RBAC (Role-Based Access Control) - Centralized Policies
 * 
 * Define all permissions and role-based access rules in one place
 * to avoid duplication across API routes and ensure consistency.
 */

export type UserRole = 'admin' | 'director' | 'guide' | 'finance' | 'support';

export type Resource = 
  | 'products'      // Tours/Products management
  | 'guides'        // Guides management
  | 'users'         // Staff/Users management
  | 'bookings'      // Bookings/Reservations
  | 'customers'     // CRM - Customer data
  | 'finance'       // Financial/ERP
  | 'reviews'       // Reviews management
  | 'fleet'         // Tuk-tuks/Fleet
  | 'integrations'  // Integrations config
  | 'aurora'        // Aurora IA config
  | 'analytics'     // Analytics/Reports
  | 'settings';     // System settings

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

/**
 * Permission Matrix
 * Define what each role can do with each resource
 */
const PERMISSIONS: Record<UserRole, Record<Resource, Action[]>> = {
  admin: {
    products: ['create', 'read', 'update', 'delete', 'manage'],
    guides: ['create', 'read', 'update', 'delete', 'manage'],
    users: ['create', 'read', 'update', 'delete', 'manage'],
    bookings: ['create', 'read', 'update', 'delete', 'manage'],
    customers: ['create', 'read', 'update', 'delete', 'manage'],
    finance: ['create', 'read', 'update', 'delete', 'manage'],
    reviews: ['create', 'read', 'update', 'delete', 'manage'],
    fleet: ['create', 'read', 'update', 'delete', 'manage'],
    integrations: ['create', 'read', 'update', 'delete', 'manage'],
    aurora: ['create', 'read', 'update', 'delete', 'manage'],
    analytics: ['read', 'manage'],
    settings: ['create', 'read', 'update', 'delete', 'manage'],
  },
  director: {
    products: ['create', 'read', 'update', 'manage'],
    guides: ['create', 'read', 'update', 'manage'],
    users: ['create', 'read', 'update', 'delete', 'manage'], // Full access like admin
    bookings: ['create', 'read', 'update', 'delete', 'manage'],
    customers: ['create', 'read', 'update', 'manage'],
    finance: ['read', 'manage'],
    reviews: ['read', 'update', 'manage'],
    fleet: ['read', 'update', 'manage'],
    integrations: ['read'],
    aurora: ['read', 'update', 'manage'],
    analytics: ['read', 'manage'],
    settings: ['read', 'update'],
  },
  finance: {
    products: ['read'],
    guides: ['read'],
    users: ['read'],
    bookings: ['read', 'manage'],
    customers: ['read', 'manage'],
    finance: ['create', 'read', 'update', 'delete', 'manage'],
    reviews: ['read'],
    fleet: ['read'],
    integrations: ['read'],
    aurora: ['read'],
    analytics: ['read', 'manage'],
    settings: ['read'],
  },
  guide: {
    products: ['read'],
    guides: ['read'], // Only their own profile
    users: [],
    bookings: ['read'], // Only their own bookings
    customers: ['read'], // Only their customers
    finance: [],
    reviews: ['read'], // Only their reviews
    fleet: ['read'],
    integrations: [],
    aurora: [],
    analytics: [],
    settings: [],
  },
  support: {
    products: ['read'],
    guides: ['read'],
    users: [],
    bookings: ['read', 'update'],
    customers: ['read', 'update', 'manage'],
    finance: [],
    reviews: ['read', 'update'],
    fleet: ['read'],
    integrations: [],
    aurora: [],
    analytics: ['read'],
    settings: [],
  },
};

/**
 * Check if a role has permission to perform an action on a resource
 */
export function hasPermission(
  role: UserRole,
  resource: Resource,
  action: Action
): boolean {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action) || resourcePermissions.includes('manage');
}

/**
 * Check if a role can perform ANY action on a resource
 */
export function canAccess(role: UserRole, resource: Resource): boolean {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  return resourcePermissions && resourcePermissions.length > 0;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Record<Resource, Action[]> {
  return PERMISSIONS[role] || {};
}

/**
 * Check if user is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

/**
 * Check if user is director or above
 */
export function isDirectorOrAbove(role: UserRole): boolean {
  return role === 'admin' || role === 'director';
}

/**
 * Check if user can manage finance
 */
export function canManageFinance(role: UserRole): boolean {
  return role === 'admin' || role === 'finance';
}

/**
 * Ownership checks for guides
 * Guides can only access their own data
 */
export function canAccessOwnResource(
  role: UserRole,
  userId: string,
  resourceOwnerId: string
): boolean {
  // Admins and directors can access all resources
  if (isDirectorOrAbove(role)) return true;
  
  // Others can only access their own resources
  return userId === resourceOwnerId;
}
