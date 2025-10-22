# Sistema de Permissões Granulares - Status de Implementação

## ✅ BACKEND COMPLETO (100%)

### Database Schema Implementado
- ✅ **86 Permissões** criadas e ativas no banco
- ✅ Modelo `Permission` (resource, action, labels multi-idioma, category, sortOrder)
- ✅ Modelo `UserPermission` (canRead, canWrite por permissão individual)
- ✅ Modelo `DepartmentPermission` (canRead, canWrite por permissão individual)

### 11 Categorias de Permissões
1. **super_admin (5)**: administrator.full_access, permissions (CRUD)
2. **dashboard (1)**: dashboard.view
3. **products (14)**: products menu, tours CRUD, activities CRUD, extras CRUD
4. **bookings (7)**: bookings CRUD, assign guides, approve/reject, cancel
5. **crm (9)**: customers CRUD + export, segments, automations
6. **people (8)**: guides CRUD, staff CRUD
7. **admin (15)**: users CRUD + manage permissions, **departments CRUD + manage permissions**, integrations, settings, audit logs
8. **finance (12)**: dashboard, ledger, payroll, reports, vendors CRUD
9. **aurora (3)**: view, configure, manage knowledge base
10. **communication (7)**: emails, internal chat, notifications
11. **reports (3)**: analytics, reports, export

### APIs Implementadas
- ✅ `/api/permissions` - CRUD permissões (Administrator only)
- ✅ `/api/user-permissions` - Gerenciar permissões por usuário
- ✅ `/api/user-permissions/batch` - Atribuir múltiplas permissões (validação Staff-only)
- ✅ `/api/department-permissions` - Gerenciar permissões por departamento
- ✅ `/api/auth/permissions` - **ATUALIZADO** para retornar permissões do banco (não hardcoded)
- ✅ `/api/staff/[id]` - Update de staff **PERMITE edição sem senha** (opcional)

### Regras de Negócio Implementadas
- ✅ **Administrator** = Acesso total (read+write) a TUDO
- ✅ **Permissions** = Apenas Administrators podem criar/editar permissões do sistema
- ✅ **Staff-Only Admin** = Apenas Staff pode ter permissão `administrator.full_access` (Guides/Vendors bloqueados)
- ✅ **Granularidade Universal** = TODAS as permissões podem ser:
  - **Leitura** (canRead = true, canWrite = false)
  - **Leitura + Escritura** (canRead = true, canWrite = true)
- ✅ **Herança** = Permissões de usuário sobrescrevem permissões de departamento
- ✅ **Senha Opcional** = Ao editar staff, senha é opcional (deixar em branco mantém a senha atual)

### Scripts Disponíveis
- ✅ `scripts/seed-permissions.ts` - Seed das 86 permissões no banco
- ✅ `scripts/grant-admin-permissions.ts` - Conceder TODAS as permissões ao admin@yyd.tours

### Usuário Admin
- ✅ **admin@yyd.tours** possui **TODAS as 86 permissões** com acesso total (canRead + canWrite)

---

## ❌ FRONTEND FALTANTE (0%)

### O Que Está Faltando

#### 1. Interface de Gerenciamento de Permissões por Usuário
**Problema Atual**: A tela de "Editar Funcionário" ainda mostra checkboxes simples de módulos (Dashboard, Guides, Financial, etc.)

**Solução Necessária**: Criar interface granular que mostre:
- Lista das 86 permissões organizadas por categoria
- Para cada permissão: checkbox "Leitura" e checkbox "Escritura"
- Indicador visual de permissões herdadas do departamento
- Busca/filtro por categoria ou nome de permissão

**Arquivos a Modificar**:
- `yyd/apps/backoffice/app/staff/page.tsx` - Substituir seção "Módulos com Acesso"
- Criar componente `PermissionsManager.tsx` reutilizável

#### 2. Menu "Permissões" (Administrator Only)
**Problema Atual**: Não existe menu para criar/editar permissões do sistema

**Solução Necessária**: Criar página `/permissions` que:
- Liste todas as 86 permissões
- Permita criar novas permissões (Administrator only)
- Permita editar labels, categoria, sortOrder
- Permita ativar/desativar permissões
- Mostre quantos usuários/departamentos têm cada permissão

**Arquivos a Criar**:
- `yyd/apps/backoffice/app/permissions/page.tsx`

#### 3. Dashboard Dinâmico Baseado em Permissões
**Status**: Parcialmente implementado
- ✅ Backend retorna menus filtrados por permissões
- ❌ Frontend ainda não consome essas permissões para esconder/mostrar botões

**Solução Necessária**:
- Consumir `features.isAdministrator` do `/api/auth/permissions`
- Esconder botões "Criar", "Editar", "Excluir" baseado em canWrite
- Esconder menus inteiros baseado em canRead

#### 4. Validação de Permissões para Edição de Usuários
**Problema Atual**: Qualquer usuário pode editar qualquer funcionário

**Solução Necessária**:
- **Administrators**: podem editar QUALQUER usuário
- **Não-Administrators**: podem editar APENAS a si mesmos
- Adicionar verificação no frontend antes de mostrar botão "Editar"
- Adicionar verificação no backend (já existe no `requirePermission()` mas precisa lógica específica)

---

## 📋 Próximos Passos (Ordem de Prioridade)

### 1. Corrigir Problema de Senha ✅ CONCLUÍDO
- [x] Remover validação obrigatória de "Confirmar Senha" ao editar
- [x] Adicionar mensagem clara: "Deixe em branco para manter senha atual"
- [x] Backend já aceita senha opcional

### 2. Criar Interface de Permissões Granulares (URGENTE)
**Estimativa**: 2-3 horas de desenvolvimento

Criar componente `PermissionsManager.tsx`:
```typescript
interface PermissionsManagerProps {
  userId?: string;
  departmentId?: string;
  mode: 'user' | 'department';
}

// Busca permissões do banco via /api/permissions
// Busca permissões atuais do usuário/departamento
// Mostra UI de checkboxes agrupados por categoria
// Permite alternar canRead/canWrite individualmente
// Salva via /api/user-permissions ou /api/department-permissions
```

Integrar em:
- `yyd/apps/backoffice/app/staff/page.tsx` (substituir checkboxes)
- `yyd/apps/backoffice/app/users/page.tsx` (se existir)
- `yyd/apps/backoffice/app/departments/page.tsx` (se existir)

### 3. Criar Menu "Permissões" (Administrator Only)
**Estimativa**: 1-2 horas

- Adicionar rota `/permissions` ao sistema
- Criar página com CRUD de permissões
- Restringir acesso: `requirePermission('permissions', 'view')`
- Mostrar menu apenas se `features.isAdministrator === true`

### 4. Validação de Edição de Usuários
**Estimativa**: 30 minutos

Frontend:
```typescript
const canEditUser = (userId: string) => {
  return isAdministrator || userId === currentUserId;
};
```

Backend (`/api/staff/[id]`):
```typescript
// Administrator pode editar qualquer um
// Outros podem editar apenas a si mesmos
if (!isAdministrator && params.id !== user.userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 5. Dashboard Dinâmico
**Estimativa**: 1 hora

- Consumir `permissions` do `/api/auth/permissions`
- Esconder/mostrar botões baseado em `canWrite`
- Desabilitar links de menu sem permissão `canRead`

---

## 🧪 Como Testar o Sistema Atual

### 1. Verificar Permissões do Admin
```bash
cd yyd
npx tsx scripts/grant-admin-permissions.ts
```
**Saída Esperada**: "Admin user now has FULL ACCESS to everything! (86 permissions)"

### 2. Testar API de Permissões
```bash
curl http://localhost:5000/api/permissions \
  -H "Authorization: Bearer <token_do_admin>"
```
**Saída Esperada**: JSON com 86 permissões

### 3. Testar API de Permissões do Usuário Atual
```bash
curl http://localhost:5000/api/auth/permissions \
  -H "Authorization: Bearer <token>"
```
**Saída Esperada**:
```json
{
  "user": { "id": "...", "email": "admin@yyd.tours", "role": "admin" },
  "permissions": {
    "administrator.full_access": { "canRead": true, "canWrite": true },
    "dashboard.view": { "canRead": true, "canWrite": true },
    // ... todas as 86 permissões
  },
  "menuItems": [ /* menus filtrados */ ],
  "features": {
    "email": true,
    "notifications": true,
    "internalChat": true,
    "isAdministrator": true
  }
}
```

### 4. Testar Edição de Staff Sem Senha
1. Fazer login como Administrator
2. Ir para `/staff`
3. Clicar "Editar" em um funcionário
4. Modificar Nome ou Email
5. **Deixar campos Senha e Confirmar Senha EM BRANCO**
6. Clicar "Salvar"
7. **Resultado Esperado**: Salva com sucesso SEM pedir senha

---

## 💡 Decisões Arquiteturais

### Por Que Separar UserPermission e DepartmentPermission?
- **Herança**: Usuários herdam permissões do departamento
- **Override**: Permissões individuais sobrescrevem departamento
- **Flexibilidade**: Departamentos definem baseline, usuários ajustam exceções

### Por Que canRead e canWrite Separados?
- **Granularidade**: Leitura-apenas é comum (analistas, auditores)
- **Segurança**: Evita acidentes (ver dados sem poder modificar)
- **Compliance**: Separação de responsabilidades (SOX, GDPR)

### Por Que Administrator é uma Permissão?
- **Uniformidade**: Segue mesmo modelo de todas as permissões
- **Revogabilidade**: Fácil remover/conceder sem alterar role
- **Auditoria**: Rastreável quem tinha/tem acesso total

---

## 📊 Resumo Executivo

### O Que Funciona
✅ **Backend 100% completo**
✅ **86 permissões criadas e gerenciáveis via API**
✅ **Sistema de herança (Departamento → Usuário)**
✅ **Senha opcional ao editar funcionários**
✅ **API de permissões retorna dados do banco (não hardcoded)**

### O Que Falta
❌ **Interface visual para selecionar permissões granulares**
❌ **Menu "Permissões" para Administrators**
❌ **Dashboard que esconde botões sem permissão**
❌ **Validação "só pode editar a si mesmo" para não-Administrators**

### Impacto no Usuário
O usuário vê checkboxes antigos porque **o frontend ainda não foi atualizado** para consumir o novo sistema de permissões granulares. O backend está pronto e funcional, aguardando desenvolvimento da UI.

### Próximo Passo Crítico
**Criar componente PermissionsManager.tsx** que substitua os checkboxes simples por uma interface granular com as 86 permissões organizadas por categoria.
