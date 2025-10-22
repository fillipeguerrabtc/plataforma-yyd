import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  resource: string;
  requiredPermission: string; // format: "resource.action"
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home', path: '/dashboard', requiredPermission: 'dashboard.view' },
  { id: 'bookings', label: 'Reservas', icon: 'calendar', path: '/bookings', requiredPermission: 'bookings.view' },
  { id: 'products', label: 'Produtos', icon: 'package', path: '/products', requiredPermission: 'products.view' },
  { id: 'tours', label: 'Tours', icon: 'map', path: '/tours', requiredPermission: 'tours.view' },
  { id: 'activities', label: 'Atividades', icon: 'activity', path: '/activities', requiredPermission: 'activities.view' },
  { id: 'extras', label: 'Opções Extras', icon: 'plus-circle', path: '/extras', requiredPermission: 'extras.view' },
  { id: 'guides', label: 'Guias', icon: 'users', path: '/guides', requiredPermission: 'guides.view' },
  { id: 'staff', label: 'Funcionários', icon: 'briefcase', path: '/staff', requiredPermission: 'staff.view' },
  { id: 'customers', label: 'Clientes', icon: 'user-plus', path: '/customers', requiredPermission: 'customers.view' },
  { id: 'departments', label: 'Departamentos', icon: 'building', path: '/departments', requiredPermission: 'departments.view' },
  { id: 'users', label: 'Usuários', icon: 'user', path: '/users', requiredPermission: 'users.view' },
  { id: 'vendors', label: 'Fornecedores', icon: 'truck', path: '/vendors', requiredPermission: 'vendors.view' },
  { id: 'finance', label: 'Financeiro', icon: 'dollar-sign', path: '/finance', requiredPermission: 'finance_dashboard.view' },
  { id: 'analytics', label: 'Analytics', icon: 'bar-chart', path: '/analytics', requiredPermission: 'analytics.view' },
  { id: 'reports', label: 'Relatórios', icon: 'file-text', path: '/reports', requiredPermission: 'reports.view' },
  { id: 'integrations', label: 'Integrações', icon: 'link', path: '/integrations', requiredPermission: 'integrations.view' },
  { id: 'aurora', label: 'Aurora IA', icon: 'bot', path: '/aurora', requiredPermission: 'aurora.view' },
  { id: 'emails', label: 'E-mails', icon: 'mail', path: '/emails', requiredPermission: 'emails.view' },
  { id: 'chat', label: 'Chat Interno', icon: 'message-circle', path: '/chat', requiredPermission: 'internal_chat.view' },
  { id: 'notifications', label: 'Notificações', icon: 'bell', path: '/notifications', requiredPermission: 'notifications.view' },
  { id: 'permissions', label: 'Permissões', icon: 'shield', path: '/permissions', requiredPermission: 'permissions.view' },
  { id: 'settings', label: 'Configurações', icon: 'settings', path: '/settings', requiredPermission: 'settings.view' },
  { id: 'audit', label: 'Logs de Auditoria', icon: 'file-text', path: '/audit', requiredPermission: 'audit_logs.view' },
];

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's direct permissions
    const userPermissions = await prisma.userPermission.findMany({
      where: { userId: user.userId },
      include: {
        permission: true,
      },
    });

    // Get user's department permissions (if staff)
    let departmentPermissions: any[] = [];
    const staff = await prisma.staff.findUnique({
      where: { email: user.email },
      include: {
        department: {
          include: {
            departmentPermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (staff?.department) {
      departmentPermissions = staff.department.departmentPermissions;
    }

    // Combine permissions (user permissions override department permissions)
    const permissionMap = new Map<string, { canRead: boolean; canWrite: boolean }>();

    // First add department permissions
    departmentPermissions.forEach((dp) => {
      const key = `${dp.permission.resource}.${dp.permission.action}`;
      permissionMap.set(key, {
        canRead: dp.canRead,
        canWrite: dp.canWrite,
      });
    });

    // Then override with user permissions (higher priority)
    userPermissions.forEach((up) => {
      const key = `${up.permission.resource}.${up.permission.action}`;
      permissionMap.set(key, {
        canRead: up.canRead,
        canWrite: up.canWrite,
      });
    });

    // Check if user is Administrator
    const adminPerm = permissionMap.get('administrator.full_access');
    const isAdministrator = adminPerm?.canRead === true;

    // If Administrator, grant Read+Write to EVERYTHING
    if (isAdministrator) {
      // Get all permissions from database
      const allPermissions = await prisma.permission.findMany();
      
      // Grant full access to all permissions
      allPermissions.forEach((perm) => {
        const key = `${perm.resource}.${perm.action}`;
        permissionMap.set(key, {
          canRead: true,
          canWrite: true,
        });
      });
    }

    // Filter menu items based on permissions
    const allowedMenuItems = ALL_MENU_ITEMS.filter((item) => {
      // Administrators see everything
      if (isAdministrator) return true;

      // Check if user has read permission for this item
      const perm = permissionMap.get(item.requiredPermission);
      return perm?.canRead === true;
    });

    // Build permissions object for frontend
    const permissions: Record<string, { canRead: boolean; canWrite: boolean }> = {};
    permissionMap.forEach((value, key) => {
      permissions[key] = value;
    });

    return NextResponse.json({
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
      permissions,
      menuItems: allowedMenuItems,
      features: {
        email: user.role !== 'guide', // Guides cannot access email
        notifications: true,
        internalChat: true,
        isAdministrator,
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching permissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
