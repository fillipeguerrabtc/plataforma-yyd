import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  // Super Admin Permission - Full Access to Everything
  { resource: 'administrator', action: 'full_access', labelEn: 'Administrator - Full Access', labelPt: 'Administrador - Acesso Total', labelEs: 'Administrador - Acceso Total', category: 'super_admin', sortOrder: 0, description: 'Complete read and write access to all system features. Required to manage permissions.' },
  
  // Permissions Management (Administrator Only)
  { resource: 'permissions', action: 'view', labelEn: 'View Permissions', labelPt: 'Ver Permissões', labelEs: 'Ver Permisos', category: 'super_admin', sortOrder: 1, description: 'View all system permissions. Requires Administrator access.' },
  { resource: 'permissions', action: 'create', labelEn: 'Create Permissions', labelPt: 'Criar Permissões', labelEs: 'Crear Permisos', category: 'super_admin', sortOrder: 2, description: 'Create new permissions with universal rules. Requires Administrator access.' },
  { resource: 'permissions', action: 'update', labelEn: 'Edit Permissions', labelPt: 'Editar Permissões', labelEs: 'Editar Permisos', category: 'super_admin', sortOrder: 3, description: 'Modify existing permissions. Requires Administrator access.' },
  { resource: 'permissions', action: 'delete', labelEn: 'Delete Permissions', labelPt: 'Excluir Permissões', labelEs: 'Eliminar Permisos', category: 'super_admin', sortOrder: 4, description: 'Remove permissions from system. Requires Administrator access.' },
  
  // Dashboard
  { resource: 'dashboard', action: 'view', labelEn: 'View Dashboard', labelPt: 'Ver Dashboard', labelEs: 'Ver Dashboard', category: 'dashboard', sortOrder: 10 },
  
  // Products (Universal Menu)
  { resource: 'products', action: 'view', labelEn: 'View Products', labelPt: 'Ver Produtos', labelEs: 'Ver Productos', category: 'products', sortOrder: 15 },
  { resource: 'products', action: 'manage', labelEn: 'Manage Products', labelPt: 'Gerenciar Produtos', labelEs: 'Gestionar Productos', category: 'products', sortOrder: 16 },
  
  // Tours/Products
  { resource: 'tours', action: 'view', labelEn: 'View Tours', labelPt: 'Ver Tours', labelEs: 'Ver Tours', category: 'products', sortOrder: 10 },
  { resource: 'tours', action: 'create', labelEn: 'Create Tours', labelPt: 'Criar Tours', labelEs: 'Crear Tours', category: 'products', sortOrder: 11 },
  { resource: 'tours', action: 'update', labelEn: 'Edit Tours', labelPt: 'Editar Tours', labelEs: 'Editar Tours', category: 'products', sortOrder: 12 },
  { resource: 'tours', action: 'delete', labelEn: 'Delete Tours', labelPt: 'Excluir Tours', labelEs: 'Eliminar Tours', category: 'products', sortOrder: 13 },
  
  // Activities
  { resource: 'activities', action: 'view', labelEn: 'View Activities', labelPt: 'Ver Atividades', labelEs: 'Ver Actividades', category: 'products', sortOrder: 14 },
  { resource: 'activities', action: 'create', labelEn: 'Create Activities', labelPt: 'Criar Atividades', labelEs: 'Crear Actividades', category: 'products', sortOrder: 15 },
  { resource: 'activities', action: 'update', labelEn: 'Edit Activities', labelPt: 'Editar Atividades', labelEs: 'Editar Actividades', category: 'products', sortOrder: 16 },
  { resource: 'activities', action: 'delete', labelEn: 'Delete Activities', labelPt: 'Excluir Atividades', labelEs: 'Eliminar Actividades', category: 'products', sortOrder: 17 },
  
  // Extras (Product Options)
  { resource: 'extras', action: 'view', labelEn: 'View Extras', labelPt: 'Ver Opções Extras', labelEs: 'Ver Extras', category: 'products', sortOrder: 18 },
  { resource: 'extras', action: 'create', labelEn: 'Create Extras', labelPt: 'Criar Opções Extras', labelEs: 'Crear Extras', category: 'products', sortOrder: 19 },
  { resource: 'extras', action: 'update', labelEn: 'Edit Extras', labelPt: 'Editar Opções Extras', labelEs: 'Editar Extras', category: 'products', sortOrder: 20 },
  { resource: 'extras', action: 'delete', labelEn: 'Delete Extras', labelPt: 'Excluir Opções Extras', labelEs: 'Eliminar Extras', category: 'products', sortOrder: 21 },
  
  // Bookings
  { resource: 'bookings', action: 'view', labelEn: 'View Bookings', labelPt: 'Ver Reservas', labelEs: 'Ver Reservas', category: 'bookings', sortOrder: 30 },
  { resource: 'bookings', action: 'create', labelEn: 'Create Bookings', labelPt: 'Criar Reservas', labelEs: 'Crear Reservas', category: 'bookings', sortOrder: 31 },
  { resource: 'bookings', action: 'update', labelEn: 'Edit Bookings', labelPt: 'Editar Reservas', labelEs: 'Editar Reservas', category: 'bookings', sortOrder: 32 },
  { resource: 'bookings', action: 'delete', labelEn: 'Delete Bookings', labelPt: 'Excluir Reservas', labelEs: 'Eliminar Reservas', category: 'bookings', sortOrder: 33 },
  { resource: 'bookings', action: 'assign_guides', labelEn: 'Assign Guides to Tours', labelPt: 'Atribuir Guias aos Tours', labelEs: 'Asignar Guías a Tours', category: 'bookings', sortOrder: 34 },
  { resource: 'bookings', action: 'approve', labelEn: 'Approve Bookings', labelPt: 'Aprovar Reservas', labelEs: 'Aprobar Reservas', category: 'bookings', sortOrder: 35 },
  { resource: 'bookings', action: 'cancel', labelEn: 'Cancel Bookings', labelPt: 'Cancelar Reservas', labelEs: 'Cancelar Reservas', category: 'bookings', sortOrder: 36 },
  
  // Customers
  { resource: 'customers', action: 'view', labelEn: 'View Customers', labelPt: 'Ver Clientes', labelEs: 'Ver Clientes', category: 'crm', sortOrder: 40 },
  { resource: 'customers', action: 'create', labelEn: 'Create Customers', labelPt: 'Criar Clientes', labelEs: 'Crear Clientes', category: 'crm', sortOrder: 41 },
  { resource: 'customers', action: 'update', labelEn: 'Edit Customers', labelPt: 'Editar Clientes', labelEs: 'Editar Clientes', category: 'crm', sortOrder: 42 },
  { resource: 'customers', action: 'delete', labelEn: 'Delete Customers', labelPt: 'Excluir Clientes', labelEs: 'Eliminar Clientes', category: 'crm', sortOrder: 43 },
  { resource: 'customers', action: 'export', labelEn: 'Export Customers', labelPt: 'Exportar Clientes', labelEs: 'Exportar Clientes', category: 'crm', sortOrder: 44 },
  
  // CRM Features
  { resource: 'crm_segments', action: 'view', labelEn: 'View Customer Segments', labelPt: 'Ver Segmentos de Clientes', labelEs: 'Ver Segmentos de Clientes', category: 'crm', sortOrder: 50 },
  { resource: 'crm_segments', action: 'manage', labelEn: 'Manage Customer Segments', labelPt: 'Gerenciar Segmentos de Clientes', labelEs: 'Gestionar Segmentos de Clientes', category: 'crm', sortOrder: 51 },
  { resource: 'crm_automations', action: 'view', labelEn: 'View CRM Automations', labelPt: 'Ver Automações CRM', labelEs: 'Ver Automatizaciones CRM', category: 'crm', sortOrder: 52 },
  { resource: 'crm_automations', action: 'manage', labelEn: 'Manage CRM Automations', labelPt: 'Gerenciar Automações CRM', labelEs: 'Gestionar Automatizaciones CRM', category: 'crm', sortOrder: 53 },
  
  // Guides
  { resource: 'guides', action: 'view', labelEn: 'View Guides', labelPt: 'Ver Guias', labelEs: 'Ver Guías', category: 'people', sortOrder: 60 },
  { resource: 'guides', action: 'create', labelEn: 'Create Guides', labelPt: 'Criar Guias', labelEs: 'Crear Guías', category: 'people', sortOrder: 61 },
  { resource: 'guides', action: 'update', labelEn: 'Edit Guides', labelPt: 'Editar Guias', labelEs: 'Editar Guías', category: 'people', sortOrder: 62 },
  { resource: 'guides', action: 'delete', labelEn: 'Delete Guides', labelPt: 'Excluir Guias', labelEs: 'Eliminar Guías', category: 'people', sortOrder: 63 },
  
  // Staff
  { resource: 'staff', action: 'view', labelEn: 'View Staff', labelPt: 'Ver Funcionários', labelEs: 'Ver Personal', category: 'people', sortOrder: 70 },
  { resource: 'staff', action: 'create', labelEn: 'Create Staff', labelPt: 'Criar Funcionários', labelEs: 'Crear Personal', category: 'people', sortOrder: 71 },
  { resource: 'staff', action: 'update', labelEn: 'Edit Staff', labelPt: 'Editar Funcionários', labelEs: 'Editar Personal', category: 'people', sortOrder: 72 },
  { resource: 'staff', action: 'delete', labelEn: 'Delete Staff', labelPt: 'Excluir Funcionários', labelEs: 'Eliminar Personal', category: 'people', sortOrder: 73 },
  
  // Users
  { resource: 'users', action: 'view', labelEn: 'View Users', labelPt: 'Ver Usuários', labelEs: 'Ver Usuarios', category: 'admin', sortOrder: 80 },
  { resource: 'users', action: 'create', labelEn: 'Create Users', labelPt: 'Criar Usuários', labelEs: 'Crear Usuarios', category: 'admin', sortOrder: 81 },
  { resource: 'users', action: 'update', labelEn: 'Edit Users', labelPt: 'Editar Usuários', labelEs: 'Editar Usuarios', category: 'admin', sortOrder: 82 },
  { resource: 'users', action: 'delete', labelEn: 'Delete Users', labelPt: 'Excluir Usuários', labelEs: 'Eliminar Usuarios', category: 'admin', sortOrder: 83 },
  { resource: 'users', action: 'manage_permissions', labelEn: 'Manage User Permissions', labelPt: 'Gerenciar Permissões de Usuários', labelEs: 'Gestionar Permisos de Usuarios', category: 'admin', sortOrder: 84 },
  
  // Finance
  { resource: 'finance_dashboard', action: 'view', labelEn: 'View Finance Dashboard', labelPt: 'Ver Dashboard Financeiro', labelEs: 'Ver Dashboard Financiero', category: 'finance', sortOrder: 90 },
  { resource: 'finance_ledger', action: 'view', labelEn: 'View General Ledger', labelPt: 'Ver Livro Razão', labelEs: 'Ver Libro Mayor', category: 'finance', sortOrder: 91 },
  { resource: 'finance_ledger', action: 'create', labelEn: 'Create Ledger Entries', labelPt: 'Criar Lançamentos', labelEs: 'Crear Asientos', category: 'finance', sortOrder: 92 },
  { resource: 'finance_payroll', action: 'view', labelEn: 'View Payroll', labelPt: 'Ver Folha de Pagamento', labelEs: 'Ver Nómina', category: 'finance', sortOrder: 93 },
  { resource: 'finance_payroll', action: 'create', labelEn: 'Create Payroll', labelPt: 'Criar Folha de Pagamento', labelEs: 'Crear Nómina', category: 'finance', sortOrder: 94 },
  { resource: 'finance_payroll', action: 'process', labelEn: 'Process Payments', labelPt: 'Processar Pagamentos', labelEs: 'Procesar Pagos', category: 'finance', sortOrder: 95 },
  { resource: 'finance_reports', action: 'view', labelEn: 'View Financial Reports', labelPt: 'Ver Relatórios Financeiros', labelEs: 'Ver Informes Financieros', category: 'finance', sortOrder: 96 },
  { resource: 'finance_reports', action: 'export', labelEn: 'Export Financial Reports', labelPt: 'Exportar Relatórios Financeiros', labelEs: 'Exportar Informes Financieros', category: 'finance', sortOrder: 97 },
  
  // Vendors
  { resource: 'vendors', action: 'view', labelEn: 'View Vendors', labelPt: 'Ver Fornecedores', labelEs: 'Ver Proveedores', category: 'finance', sortOrder: 100 },
  { resource: 'vendors', action: 'create', labelEn: 'Create Vendors', labelPt: 'Criar Fornecedores', labelEs: 'Crear Proveedores', category: 'finance', sortOrder: 101 },
  { resource: 'vendors', action: 'update', labelEn: 'Edit Vendors', labelPt: 'Editar Fornecedores', labelEs: 'Editar Proveedores', category: 'finance', sortOrder: 102 },
  { resource: 'vendors', action: 'delete', labelEn: 'Delete Vendors', labelPt: 'Excluir Fornecedores', labelEs: 'Eliminar Proveedores', category: 'finance', sortOrder: 103 },
  
  // Departments (Granular CRUD)
  { resource: 'departments', action: 'view', labelEn: 'View Departments', labelPt: 'Ver Departamentos', labelEs: 'Ver Departamentos', category: 'admin', sortOrder: 110 },
  { resource: 'departments', action: 'create', labelEn: 'Create Departments', labelPt: 'Criar Departamentos', labelEs: 'Crear Departamentos', category: 'admin', sortOrder: 111 },
  { resource: 'departments', action: 'update', labelEn: 'Edit Departments', labelPt: 'Editar Departamentos', labelEs: 'Editar Departamentos', category: 'admin', sortOrder: 112 },
  { resource: 'departments', action: 'delete', labelEn: 'Delete Departments', labelPt: 'Excluir Departamentos', labelEs: 'Eliminar Departamentos', category: 'admin', sortOrder: 113 },
  { resource: 'departments', action: 'manage_permissions', labelEn: 'Manage Department Permissions', labelPt: 'Gerenciar Permissões de Departamentos', labelEs: 'Gestionar Permisos de Departamentos', category: 'admin', sortOrder: 114 },
  
  // Integrations
  { resource: 'integrations', action: 'view', labelEn: 'View Integrations', labelPt: 'Ver Integrações', labelEs: 'Ver Integraciones', category: 'admin', sortOrder: 120 },
  { resource: 'integrations', action: 'manage', labelEn: 'Manage Integrations', labelPt: 'Gerenciar Integrações', labelEs: 'Gestionar Integraciones', category: 'admin', sortOrder: 121 },
  
  // Aurora IA
  { resource: 'aurora', action: 'view', labelEn: 'View Aurora IA', labelPt: 'Ver Aurora IA', labelEs: 'Ver Aurora IA', category: 'aurora', sortOrder: 130 },
  { resource: 'aurora', action: 'configure', labelEn: 'Configure Aurora IA', labelPt: 'Configurar Aurora IA', labelEs: 'Configurar Aurora IA', category: 'aurora', sortOrder: 131 },
  { resource: 'aurora', action: 'manage_knowledge', labelEn: 'Manage Knowledge Base', labelPt: 'Gerenciar Base de Conhecimento', labelEs: 'Gestionar Base de Conocimiento', category: 'aurora', sortOrder: 132 },
  
  // Email System
  { resource: 'emails', action: 'view', labelEn: 'View Emails', labelPt: 'Ver E-mails', labelEs: 'Ver Correos', category: 'communication', sortOrder: 140 },
  { resource: 'emails', action: 'send', labelEn: 'Send Emails', labelPt: 'Enviar E-mails', labelEs: 'Enviar Correos', category: 'communication', sortOrder: 141 },
  { resource: 'emails', action: 'manage_templates', labelEn: 'Manage Email Templates', labelPt: 'Gerenciar Templates de E-mail', labelEs: 'Gestionar Plantillas de Correo', category: 'communication', sortOrder: 142 },
  
  // Internal Chat
  { resource: 'internal_chat', action: 'view', labelEn: 'View Internal Chat', labelPt: 'Ver Chat Interno', labelEs: 'Ver Chat Interno', category: 'communication', sortOrder: 150 },
  { resource: 'internal_chat', action: 'send', labelEn: 'Send Messages', labelPt: 'Enviar Mensagens', labelEs: 'Enviar Mensajes', category: 'communication', sortOrder: 151 },
  
  // Notifications
  { resource: 'notifications', action: 'view', labelEn: 'View Notifications', labelPt: 'Ver Notificações', labelEs: 'Ver Notificaciones', category: 'communication', sortOrder: 160 },
  { resource: 'notifications', action: 'manage', labelEn: 'Manage Notifications', labelPt: 'Gerenciar Notificações', labelEs: 'Gestionar Notificaciones', category: 'communication', sortOrder: 161 },
  
  // Analytics & Reports
  { resource: 'analytics', action: 'view', labelEn: 'View Analytics', labelPt: 'Ver Análises', labelEs: 'Ver Análisis', category: 'reports', sortOrder: 170 },
  { resource: 'reports', action: 'view', labelEn: 'View Reports', labelPt: 'Ver Relatórios', labelEs: 'Ver Informes', category: 'reports', sortOrder: 171 },
  { resource: 'reports', action: 'export', labelEn: 'Export Reports', labelPt: 'Exportar Relatórios', labelEs: 'Exportar Informes', category: 'reports', sortOrder: 172 },
  
  // Settings
  { resource: 'settings', action: 'view', labelEn: 'View Settings', labelPt: 'Ver Configurações', labelEs: 'Ver Configuración', category: 'admin', sortOrder: 180 },
  { resource: 'settings', action: 'manage', labelEn: 'Manage Settings', labelPt: 'Gerenciar Configurações', labelEs: 'Gestionar Configuración', category: 'admin', sortOrder: 181 },
  
  // Audit Logs
  { resource: 'audit_logs', action: 'view', labelEn: 'View Audit Logs', labelPt: 'Ver Logs de Auditoria', labelEs: 'Ver Registros de Auditoría', category: 'admin', sortOrder: 190 },
];

async function main() {
  console.log('🌱 Seeding permissions...');
  
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: permission.resource,
          action: permission.action,
        },
      },
      update: {
        labelEn: permission.labelEn,
        labelPt: permission.labelPt,
        labelEs: permission.labelEs,
        category: permission.category,
        sortOrder: permission.sortOrder,
      },
      create: permission,
    });
  }
  
  console.log(`✅ Created/updated ${permissions.length} permissions`);
  console.log('\n📊 Permissions by category:');
  const byCategory = permissions.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} permissions`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
