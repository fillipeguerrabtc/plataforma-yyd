import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getRolePermissions, type Resource } from '@/lib/rbac';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  resource: Resource;
  requiredAction: 'read' | 'create' | 'update' | 'delete' | 'manage';
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home', path: '/dashboard', resource: 'analytics', requiredAction: 'read' },
  { id: 'bookings', label: 'Reservas', icon: 'calendar', path: '/bookings', resource: 'bookings', requiredAction: 'read' },
  { id: 'products', label: 'Tours', icon: 'map', path: '/products', resource: 'products', requiredAction: 'read' },
  { id: 'guides', label: 'Guias', icon: 'users', path: '/guides', resource: 'guides', requiredAction: 'read' },
  { id: 'staff', label: 'Funcionários', icon: 'briefcase', path: '/staff', resource: 'users', requiredAction: 'read' },
  { id: 'fleet', label: 'Frota', icon: 'truck', path: '/fleet', resource: 'fleet', requiredAction: 'read' },
  { id: 'customers', label: 'Clientes', icon: 'user-plus', path: '/customers', resource: 'customers', requiredAction: 'read' },
  { id: 'finance', label: 'Financeiro', icon: 'dollar-sign', path: '/finance', resource: 'finance', requiredAction: 'read' },
  { id: 'analytics', label: 'Analytics', icon: 'bar-chart', path: '/analytics', resource: 'analytics', requiredAction: 'read' },
  { id: 'reviews', label: 'Avaliações', icon: 'star', path: '/reviews', resource: 'reviews', requiredAction: 'read' },
  { id: 'integrations', label: 'Integrações', icon: 'link', path: '/integrations', resource: 'integrations', requiredAction: 'read' },
  { id: 'aurora', label: 'Aurora IA', icon: 'bot', path: '/aurora', resource: 'aurora', requiredAction: 'read' },
  { id: 'settings', label: 'Configurações', icon: 'settings', path: '/settings', resource: 'settings', requiredAction: 'read' },
];

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rolePermissions = getRolePermissions(user.role);

    const allowedMenuItems = ALL_MENU_ITEMS.filter((item) => {
      const resourcePermissions = rolePermissions[item.resource] || [];
      return resourcePermissions.includes(item.requiredAction) || resourcePermissions.includes('manage');
    });

    const hasEmailAccess = user.role !== 'guide';

    return NextResponse.json({
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
      permissions: rolePermissions,
      menuItems: allowedMenuItems,
      features: {
        email: hasEmailAccess,
        notifications: true,
        internalChat: true,
      },
    });
  } catch (error: any) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
