import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  // Dashboard
  { resource: 'dashboard', action: 'view', labelEn: 'View Dashboard', labelPt: 'Ver Dashboard', labelEs: 'Ver Dashboard', category: 'dashboard', sortOrder: 1 },
  
  // Tours/Products
  { resource: 'tours', action: 'view', labelEn: 'View Tours', labelPt: 'Ver Tours', labelEs: 'Ver Tours', category: 'tours', sortOrder: 10 },
  { resource: 'tours', action: 'create', labelEn: 'Create Tours', labelPt: 'Criar Tours', labelEs: 'Crear Tours', category: 'tours', sortOrder: 11 },
  { resource: 'tours', action: 'update', labelEn: 'Edit Tours', labelPt: 'Editar Tours', labelEs: 'Editar Tours', category: 'tours', sortOrder: 12 },
  { resource: 'tours', action: 'delete', labelEn: 'Delete Tours', labelPt: 'Excluir Tours', labelEs: 'Eliminar Tours', category: 'tours', sortOrder: 13 },
  { resource: 'tours', action: 'configure_activities', labelEn: 'Configure Tour Activities', labelPt: 'Configurar Atividades do Tour', labelEs: 'Configurar Actividades del Tour', category: 'tours', sortOrder: 14 },
  
  // Bookings
  { resource: 'bookings', action: 'view', labelEn: 'View Bookings', labelPt: 'Ver Reservas', labelEs: 'Ver Reservas', category: 'bookings', sortOrder: 20 },
  { resource: 'bookings', action: 'create', labelEn: 'Create Bookings', labelPt: 'Criar Reservas', labelEs: 'Crear Reservas', category: 'bookings', sortOrder: 21 },
  { resource: 'bookings', action: 'update', labelEn: 'Edit Bookings', labelPt: 'Editar Reservas', labelEs: 'Editar Reservas', category: 'bookings', sortOrder: 22 },
  { resource: 'bookings', action: 'delete', labelEn: 'Delete Bookings', labelPt: 'Excluir Reservas', labelEs: 'Eliminar Reservas', category: 'bookings', sortOrder: 23 },
  { resource: 'bookings', action: 'assign_guides', labelEn: 'Assign Guides to Tours', labelPt: 'Atribuir Guias aos Tours', labelEs: 'Asignar Guías a Tours', category: 'bookings', sortOrder: 24 },
  { resource: 'bookings', action: 'approve', labelEn: 'Approve Bookings', labelPt: 'Aprovar Reservas', labelEs: 'Aprobar Reservas', category: 'bookings', sortOrder: 25 },
  { resource: 'bookings', action: 'cancel', labelEn: 'Cancel Bookings', labelPt: 'Cancelar Reservas', labelEs: 'Cancelar Reservas', category: 'bookings', sortOrder: 26 },
  
  // Customers
  { resource: 'customers', action: 'view', labelEn: 'View Customers', labelPt: 'Ver Clientes', labelEs: 'Ver Clientes', category: 'crm', sortOrder: 30 },
  { resource: 'customers', action: 'create', labelEn: 'Create Customers', labelPt: 'Criar Clientes', labelEs: 'Crear Clientes', category: 'crm', sortOrder: 31 },
  { resource: 'customers', action: 'update', labelEn: 'Edit Customers', labelPt: 'Editar Clientes', labelEs: 'Editar Clientes', category: 'crm', sortOrder: 32 },
  { resource: 'customers', action: 'delete', labelEn: 'Delete Customers', labelPt: 'Excluir Clientes', labelEs: 'Eliminar Clientes', category: 'crm', sortOrder: 33 },
  { resource: 'customers', action: 'export', labelEn: 'Export Customers', labelPt: 'Exportar Clientes', labelEs: 'Exportar Clientes', category: 'crm', sortOrder: 34 },
  
  // CRM Features
  { resource: 'crm_segments', action: 'view', labelEn: 'View Customer Segments', labelPt: 'Ver Segmentos de Clientes', labelEs: 'Ver Segmentos de Clientes', category: 'crm', sortOrder: 40 },
  { resource: 'crm_segments', action: 'manage', labelEn: 'Manage Customer Segments', labelPt: 'Gerenciar Segmentos de Clientes', labelEs: 'Gestionar Segmentos de Clientes', category: 'crm', sortOrder: 41 },
  { resource: 'crm_automations', action: 'view', labelEn: 'View CRM Automations', labelPt: 'Ver Automações CRM', labelEs: 'Ver Automatizaciones CRM', category: 'crm', sortOrder: 42 },
  { resource: 'crm_automations', action: 'manage', labelEn: 'Manage CRM Automations', labelPt: 'Gerenciar Automações CRM', labelEs: 'Gestionar Automatizaciones CRM', category: 'crm', sortOrder: 43 },
  
  // Guides
  { resource: 'guides', action: 'view', labelEn: 'View Guides', labelPt: 'Ver Guias', labelEs: 'Ver Guías', category: 'people', sortOrder: 50 },
  { resource: 'guides', action: 'create', labelEn: 'Create Guides', labelPt: 'Criar Guias', labelEs: 'Crear Guías', category: 'people', sortOrder: 51 },
  { resource: 'guides', action: 'update', labelEn: 'Edit Guides', labelPt: 'Editar Guias', labelEs: 'Editar Guías', category: 'people', sortOrder: 52 },
  { resource: 'guides', action: 'delete', labelEn: 'Delete Guides', labelPt: 'Excluir Guias', labelEs: 'Eliminar Guías', category: 'people', sortOrder: 53 },
  
  // Staff
  { resource: 'staff', action: 'view', labelEn: 'View Staff', labelPt: 'Ver Funcionários', labelEs: 'Ver Personal', category: 'people', sortOrder: 60 },
  { resource: 'staff', action: 'create', labelEn: 'Create Staff', labelPt: 'Criar Funcionários', labelEs: 'Crear Personal', category: 'people', sortOrder: 61 },
  { resource: 'staff', action: 'update', labelEn: 'Edit Staff', labelPt: 'Editar Funcionários', labelEs: 'Editar Personal', category: 'people', sortOrder: 62 },
  { resource: 'staff', action: 'delete', labelEn: 'Delete Staff', labelPt: 'Excluir Funcionários', labelEs: 'Eliminar Personal', category: 'people', sortOrder: 63 },
  
  // Users
  { resource: 'users', action: 'view', labelEn: 'View Users', labelPt: 'Ver Usuários', labelEs: 'Ver Usuarios', category: 'admin', sortOrder: 70 },
  { resource: 'users', action: 'create', labelEn: 'Create Users', labelPt: 'Criar Usuários', labelEs: 'Crear Usuarios', category: 'admin', sortOrder: 71 },
  { resource: 'users', action: 'update', labelEn: 'Edit Users', labelPt: 'Editar Usuários', labelEs: 'Editar Usuarios', category: 'admin', sortOrder: 72 },
  { resource: 'users', action: 'delete', labelEn: 'Delete Users', labelPt: 'Excluir Usuários', labelEs: 'Eliminar Usuarios', category: 'admin', sortOrder: 73 },
  { resource: 'users', action: 'manage_permissions', labelEn: 'Manage User Permissions', labelPt: 'Gerenciar Permissões de Usuários', labelEs: 'Gestionar Permisos de Usuarios', category: 'admin', sortOrder: 74 },
  
  // Finance
  { resource: 'finance_dashboard', action: 'view', labelEn: 'View Finance Dashboard', labelPt: 'Ver Dashboard Financeiro', labelEs: 'Ver Dashboard Financiero', category: 'finance', sortOrder: 80 },
  { resource: 'finance_ledger', action: 'view', labelEn: 'View General Ledger', labelPt: 'Ver Livro Razão', labelEs: 'Ver Libro Mayor', category: 'finance', sortOrder: 81 },
  { resource: 'finance_ledger', action: 'create', labelEn: 'Create Ledger Entries', labelPt: 'Criar Lançamentos', labelEs: 'Crear Asientos', category: 'finance', sortOrder: 82 },
  { resource: 'finance_payroll', action: 'view', labelEn: 'View Payroll', labelPt: 'Ver Folha de Pagamento', labelEs: 'Ver Nómina', category: 'finance', sortOrder: 83 },
  { resource: 'finance_payroll', action: 'create', labelEn: 'Create Payroll', labelPt: 'Criar Folha de Pagamento', labelEs: 'Crear Nómina', category: 'finance', sortOrder: 84 },
  { resource: 'finance_payroll', action: 'process', labelEn: 'Process Payments', labelPt: 'Processar Pagamentos', labelEs: 'Procesar Pagos', category: 'finance', sortOrder: 85 },
  { resource: 'finance_reports', action: 'view', labelEn: 'View Financial Reports', labelPt: 'Ver Relatórios Financeiros', labelEs: 'Ver Informes Financieros', category: 'finance', sortOrder: 86 },
  { resource: 'finance_reports', action: 'export', labelEn: 'Export Financial Reports', labelPt: 'Exportar Relatórios Financeiros', labelEs: 'Exportar Informes Financieros', category: 'finance', sortOrder: 87 },
  
  // Vendors
  { resource: 'vendors', action: 'view', labelEn: 'View Vendors', labelPt: 'Ver Fornecedores', labelEs: 'Ver Proveedores', category: 'finance', sortOrder: 90 },
  { resource: 'vendors', action: 'create', labelEn: 'Create Vendors', labelPt: 'Criar Fornecedores', labelEs: 'Crear Proveedores', category: 'finance', sortOrder: 91 },
  { resource: 'vendors', action: 'update', labelEn: 'Edit Vendors', labelPt: 'Editar Fornecedores', labelEs: 'Editar Proveedores', category: 'finance', sortOrder: 92 },
  { resource: 'vendors', action: 'delete', labelEn: 'Delete Vendors', labelPt: 'Excluir Fornecedores', labelEs: 'Eliminar Proveedores', category: 'finance', sortOrder: 93 },
  
  // Departments
  { resource: 'departments', action: 'view', labelEn: 'View Departments', labelPt: 'Ver Departamentos', labelEs: 'Ver Departamentos', category: 'admin', sortOrder: 100 },
  { resource: 'departments', action: 'manage', labelEn: 'Manage Departments', labelPt: 'Gerenciar Departamentos', labelEs: 'Gestionar Departamentos', category: 'admin', sortOrder: 101 },
  { resource: 'departments', action: 'manage_permissions', labelEn: 'Manage Department Permissions', labelPt: 'Gerenciar Permissões de Departamentos', labelEs: 'Gestionar Permisos de Departamentos', category: 'admin', sortOrder: 102 },
  
  // Integrations
  { resource: 'integrations', action: 'view', labelEn: 'View Integrations', labelPt: 'Ver Integrações', labelEs: 'Ver Integraciones', category: 'admin', sortOrder: 110 },
  { resource: 'integrations', action: 'manage', labelEn: 'Manage Integrations', labelPt: 'Gerenciar Integrações', labelEs: 'Gestionar Integraciones', category: 'admin', sortOrder: 111 },
  
  // Aurora IA
  { resource: 'aurora', action: 'view', labelEn: 'View Aurora IA', labelPt: 'Ver Aurora IA', labelEs: 'Ver Aurora IA', category: 'aurora', sortOrder: 120 },
  { resource: 'aurora', action: 'configure', labelEn: 'Configure Aurora IA', labelPt: 'Configurar Aurora IA', labelEs: 'Configurar Aurora IA', category: 'aurora', sortOrder: 121 },
  { resource: 'aurora', action: 'manage_knowledge', labelEn: 'Manage Knowledge Base', labelPt: 'Gerenciar Base de Conhecimento', labelEs: 'Gestionar Base de Conocimiento', category: 'aurora', sortOrder: 122 },
  
  // Email System
  { resource: 'emails', action: 'view', labelEn: 'View Emails', labelPt: 'Ver E-mails', labelEs: 'Ver Correos', category: 'communication', sortOrder: 130 },
  { resource: 'emails', action: 'send', labelEn: 'Send Emails', labelPt: 'Enviar E-mails', labelEs: 'Enviar Correos', category: 'communication', sortOrder: 131 },
  { resource: 'emails', action: 'manage_templates', labelEn: 'Manage Email Templates', labelPt: 'Gerenciar Templates de E-mail', labelEs: 'Gestionar Plantillas de Correo', category: 'communication', sortOrder: 132 },
  
  // Internal Chat
  { resource: 'internal_chat', action: 'view', labelEn: 'View Internal Chat', labelPt: 'Ver Chat Interno', labelEs: 'Ver Chat Interno', category: 'communication', sortOrder: 140 },
  { resource: 'internal_chat', action: 'send', labelEn: 'Send Messages', labelPt: 'Enviar Mensagens', labelEs: 'Enviar Mensajes', category: 'communication', sortOrder: 141 },
  
  // Notifications
  { resource: 'notifications', action: 'view', labelEn: 'View Notifications', labelPt: 'Ver Notificações', labelEs: 'Ver Notificaciones', category: 'communication', sortOrder: 150 },
  { resource: 'notifications', action: 'manage', labelEn: 'Manage Notifications', labelPt: 'Gerenciar Notificações', labelEs: 'Gestionar Notificaciones', category: 'communication', sortOrder: 151 },
  
  // Analytics & Reports
  { resource: 'analytics', action: 'view', labelEn: 'View Analytics', labelPt: 'Ver Análises', labelEs: 'Ver Análisis', category: 'reports', sortOrder: 160 },
  { resource: 'reports', action: 'view', labelEn: 'View Reports', labelPt: 'Ver Relatórios', labelEs: 'Ver Informes', category: 'reports', sortOrder: 161 },
  { resource: 'reports', action: 'export', labelEn: 'Export Reports', labelPt: 'Exportar Relatórios', labelEs: 'Exportar Informes', category: 'reports', sortOrder: 162 },
  
  // Settings
  { resource: 'settings', action: 'view', labelEn: 'View Settings', labelPt: 'Ver Configurações', labelEs: 'Ver Configuración', category: 'admin', sortOrder: 170 },
  { resource: 'settings', action: 'manage', labelEn: 'Manage Settings', labelPt: 'Gerenciar Configurações', labelEs: 'Gestionar Configuración', category: 'admin', sortOrder: 171 },
  
  // Audit Logs
  { resource: 'audit_logs', action: 'view', labelEn: 'View Audit Logs', labelPt: 'Ver Logs de Auditoria', labelEs: 'Ver Registros de Auditoría', category: 'admin', sortOrder: 180 },
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
}

main()
  .catch((e) => {
    console.error('❌ Error seeding permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
