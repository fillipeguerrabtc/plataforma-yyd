# Guia de Roles e Permissões - YYD Backoffice

## Sistema RBAC (Role-Based Access Control)

Cada usuário no sistema tem um **role** que define exatamente o que ele pode fazer.

## Roles Disponíveis

### 1. **ADMIN** (Administrador)
**Acesso:** Total e irrestrito a tudo
- ✅ Criar, editar, deletar qualquer coisa
- ✅ Gerenciar usuários e staff
- ✅ Ver e gerenciar finanças completas
- ✅ Configurar integrações
- ✅ Configurar Aurora IA
- ✅ Criar contas Stripe Connect

**Exemplo de uso:** Dono da empresa, CTO, CEO

### 2. **DIRECTOR** (Diretor)
**Acesso:** Gerenciamento operacional completo
- ✅ Gerenciar produtos/tours
- ✅ Gerenciar guias e criar contas Stripe
- ✅ Gerenciar bookings e clientes
- ✅ **Ver** finanças (mas não editar contas)
- ✅ Configurar Aurora IA
- ❌ **NÃO pode** deletar usuários

**Exemplo de uso:** Gerente geral, diretor de operações

### 3. **FINANCE** (Financeiro)
**Acesso:** Foco em finanças e contabilidade
- ✅ **Controle total** de finanças
- ✅ Criar/editar contas, razão, AR/AP
- ✅ Ver relatórios e analytics
- ✅ Ver produtos, guias, bookings
- ❌ **NÃO pode** editar produtos ou guias
- ❌ **NÃO pode** configurar integrações

**Exemplo de uso:** Contador, controller financeiro

### 4. **GUIDE** (Guia)
**Acesso:** Apenas dados relacionados a ele
- ✅ Ver seus próprios tours
- ✅ Ver suas próprias reservas
- ✅ Ver seus clientes
- ❌ **NÃO pode** ver outros guias
- ❌ **NÃO pode** ver finanças
- ❌ **NÃO pode** editar nada

**Exemplo de uso:** Guias de tour, motoristas

### 5. **SUPPORT** (Suporte)
**Acesso:** Atendimento ao cliente
- ✅ Ver e editar bookings
- ✅ Ver e gerenciar clientes (CRM)
- ✅ Ver e editar reviews
- ✅ Ver produtos e guias
- ❌ **NÃO pode** ver finanças
- ❌ **NÃO pode** editar produtos

**Exemplo de uso:** Atendimento ao cliente, recepcionista

## Como Criar Usuários com Diferentes Permissões

### Via Interface (Backoffice)
1. Acesse **Pessoas → Funcionários**
2. Clique em **Criar Funcionário**
3. Preencha os dados:
   - Nome
   - Email
   - **Senha** (importante!)
   - Posição
   - Departamento
4. **Escolha o Role** no campo "Access Level":
   - `admin` → Administrador
   - `director` → Diretor
   - `finance` → Financeiro
   - `guide` → Guia
   - `support` → Suporte
5. Salve

O sistema automaticamente:
- Cria o registro em **Staff**
- Cria o registro em **User** (para login)
- Sincroniza a senha com hash bcrypt
- Ativa o usuário

### Via Script (Desenvolvimento)
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Exemplo: Criar usuário de Suporte
async function createSupportUser() {
  const password = 'senha123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Criar Staff
  const staff = await prisma.staff.create({
    data: {
      email: 'maria@yyd.tours',
      name: 'Maria Silva',
      passwordHash: hashedPassword,
      position: 'Atendimento',
      department: 'Customer Support',
      role: 'support', // ← ROLE aqui
      hireDate: new Date(),
      contractType: 'full-time',
      status: 'active',
    },
  });

  // 2. Criar User (para login)
  await prisma.user.create({
    data: {
      email: 'maria@yyd.tours',
      name: 'Maria Silva',
      passwordHash: hashedPassword,
      role: 'support', // ← Mesmo ROLE
      active: true,
    },
  });

  console.log('✅ Usuário Maria criado com role: support');
}
```

## Exemplos Práticos de Permissões

### Cenário 1: Maria (Support) tenta criar conta Stripe
❌ **Bloqueado!**
```
POST /api/stripe-connect/create-account
→ Error: "Forbidden: You don't have access to guides"
```
**Por quê?** Support não tem permissão de gerenciar guias.

### Cenário 2: João (Finance) tenta ver finanças
✅ **Permitido!**
```
GET /api/financial/ledger
→ 200 OK - Retorna dados do razão
```
**Por quê?** Finance tem permissão total em finanças.

### Cenário 3: Pedro (Guide) tenta ver outro guia
❌ **Bloqueado!**
```
GET /api/guides/outro-id
→ Error: "Forbidden: You can only access your own data"
```
**Por quê?** Guias só veem seus próprios dados.

### Cenário 4: Danyella (Director) cria conta Stripe
✅ **Permitido!**
```
POST /api/stripe-connect/create-account
→ 200 OK - Conta criada
```
**Por quê?** Director tem permissão de gerenciar guias.

## Verificando Permissões no Código

O sistema usa 3 funções de autenticação:

```typescript
// 1. Apenas verificar se está logado (qualquer role)
requireAuth(request)

// 2. Verificar permissão específica
requirePermission(request, 'products', 'create') // Pode criar produtos?

// 3. Verificar acesso a recurso
requireResourceAccess(request, 'finance') // Tem acesso a finanças?
```

## Matriz de Permissões Completa

| Recurso       | Admin | Director | Finance | Guide | Support |
|--------------|-------|----------|---------|-------|---------|
| Products     | 🟢 Tudo | 🟢 CRUD  | 🟡 Ver  | 🟡 Ver | 🟡 Ver  |
| Guides       | 🟢 Tudo | 🟢 CRUD  | 🟡 Ver  | 🟡 Próprio | 🟡 Ver |
| Users        | 🟢 Tudo | 🟡 Ver/Editar | 🟡 Ver | ❌ Nada | ❌ Nada |
| Bookings     | 🟢 Tudo | 🟢 CRUD  | 🟡 Ver  | 🟡 Próprio | 🟢 Ver/Editar |
| Customers    | 🟢 Tudo | 🟢 CRUD  | 🟡 Ver  | 🟡 Próprio | 🟢 CRUD |
| Finance      | 🟢 Tudo | 🟡 Ver   | 🟢 Tudo | ❌ Nada | ❌ Nada |
| Reviews      | 🟢 Tudo | 🟢 Gerenciar | 🟡 Ver | 🟡 Próprio | 🟢 Ver/Editar |
| Integrations | 🟢 Tudo | 🟡 Ver   | 🟡 Ver  | ❌ Nada | ❌ Nada |
| Aurora IA    | 🟢 Tudo | 🟢 Gerenciar | 🟡 Ver | ❌ Nada | ❌ Nada |
| Analytics    | 🟢 Ver  | 🟢 Ver   | 🟢 Ver  | ❌ Nada | 🟡 Ver  |

🟢 = Acesso total | 🟡 = Acesso limitado | ❌ = Sem acesso

## Testando o Sistema

### Teste 1: Criar 3 usuários diferentes
```bash
cd yyd
npx tsx scripts/create-test-users.ts
```

### Teste 2: Fazer login com cada um
1. Login como `maria@yyd.tours` (Support)
   - Veja: Só consegue acessar CRM e Bookings
   - Tente: Criar conta Stripe → ❌ Bloqueado

2. Login como `joao@yyd.tours` (Finance)
   - Veja: Acesso total a Financeiro
   - Tente: Editar produto → ❌ Bloqueado

3. Login como `danyella@yyd.tours` (Director)
   - Veja: Acesso a quase tudo
   - Tente: Criar conta Stripe → ✅ Funciona!

## Conclusão

✅ **Sim, o sistema está COMPLETAMENTE individualizado!**
- Cada usuário tem seu próprio login
- Cada role tem permissões específicas
- As permissões são validadas em TODAS as APIs
- Não há como burlar - tudo é verificado no backend
