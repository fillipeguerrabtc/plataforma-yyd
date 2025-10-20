# 🚀 Plataforma YYD - Yes, You Deserve! (v2.0 Produção)

**Plataforma Premium de Tours em Tuk-Tuk Elétrico** para Sintra e Cascais, Portugal

**Fundador**: Daniel Ponce  
**Destaque**: ABC Good Morning America  
**Avaliações**: Mais de 200 avaliações 5 estrelas no TripAdvisor  

---

## 📚 Índice da Documentação

Esta pasta `/docs` contém **TODA** a documentação técnica da plataforma YYD:

### Documentação Principal
- **[IMPLEMENTACAO-STATUS.md](./IMPLEMENTACAO-STATUS.md)** ✅ - Status atual de TODAS as 63 funcionalidades de produção
- **[CHANGELOG.md](./CHANGELOG.md)** ✅ - Histórico completo de mudanças
- **[AUTENTICACAO.md](./AUTENTICACAO.md)** 🔄 - Sistema de autenticação RBAC (em tradução)
- **[API-REFERENCIA.md](./API-REFERENCIA.md)** 🔄 - Todos os endpoints da API com exemplos (em tradução)
- **[STRIPE-MIGRACAO.md](./STRIPE-MIGRACAO.md)** 🔄 - Guia de migração Stripe test → live (em tradução)
- **[ARQUITETURA.md](./ARQUITETURA.md)** ⏳ - Arquitetura técnica completa (pendente)

### Recursos Adicionais
- **[DEPLOY.md](./DEPLOY.md)** - Guia de deploy em produção
- **[DESENVOLVIMENTO.md](./DESENVOLVIMENTO.md)** - Setup de desenvolvimento local
- **[TESTES.md](./TESTES.md)** - Estratégia de testes e QA
- **[SEGURANCA.md](./SEGURANCA.md)** - Melhores práticas de segurança

---

## 🎯 Visão Geral da Plataforma

### Três Módulos Principais

#### 1️⃣ **Client App** (Porta 5000)
Website público onde clientes:
- Navegam pelos 3 tours reais (Meio-Dia €340-400, Dia Completo €440-520, Premium €580-1650)
- Completam fluxo de reserva com preços sazonais
- Pagam com segurança via Stripe
- Recebem vouchers PDF automaticamente
- Conversam com Aurora IA

**Stack Técnica**: Next.js 14, Stripe, Tailwind CSS, PostgreSQL

#### 2️⃣ **Backoffice App** (Porta 3001)
Sistema administrativo ERP/CRM com:
- Dashboard com estatísticas em tempo real
- Gestão completa de reservas
- Calendário com atribuição de guias
- CRUD de Tours (multilíngue PT/EN/ES)
- Gestão de Guias, Clientes, Financeiro
- Configuração Aurora IA
- Autenticação RBAC (5 perfis)

**Stack Técnica**: Next.js 14, Prisma ORM, JWT Auth, RBAC

#### 3️⃣ **Aurora IA**
Concierge de IA autônomo que:
- Responde via WhatsApp & Facebook Messenger
- Fornece informações sobre tours em 3 idiomas
- Cria reservas completas via chat
- Gera links de pagamento Stripe
- Transfere consultas complexas para humanos
- Auto-avalia e melhora continuamente

**Stack Técnica**: OpenAI GPT-4o-mini, WhatsApp Cloud API, Facebook Graph API

---

## 🎨 Identidade Visual

### Identidade Visual Oficial YYD
- **Primária**: Turquesa `#23C0E3`
- **Secundária**: Verde WhatsApp `#25D366`
- **Destaque**: Amarelo `#FFD700`
- **Texto**: Cinza Escuro `#333333`
- **Fundo**: Branco `#FFFFFF`

### Tipografia
- **Títulos Script**: Pacifico (cursiva)
- **Texto Corpo**: Montserrat (sans-serif)
- **Números**: Poppins (sans-serif)

### Logo
Logo circular "Yes, you deserve!" em script aparece em **TODAS as páginas** (Cliente + Backoffice)

---

## 🗄️ Esquema do Banco de Dados

**Tecnologia**: PostgreSQL via Prisma ORM

### Modelos Principais
- `Product` - Tours com conteúdo multilíngue (PT/EN/ES)
- `ProductSeasonPrice` - Preços sazonais
- `Booking` - Reservas de tours
- `Customer` - Dados CRM
- `Guide` - Motoristas com certificações
- `Payment` - Pagamentos Stripe
- `User` - Staff do Backoffice com perfis RBAC
- `AuroraConversation` - Logs de chat IA

Ver [ARQUITETURA.md](./ARQUITETURA.md) para esquema completo.

---

## 🔐 Autenticação & Segurança

### Sistema RBAC (5 Perfis)
1. **Admin** - Acesso total ao sistema
2. **Diretor** - Operações comerciais + relatórios
3. **Financeiro** - Apenas dados financeiros
4. **Guia** - Apenas próprias reservas + calendário
5. **Suporte** - Atendimento ao cliente

### Recursos de Segurança
- Autenticação JWT com expiração de 7 dias
- Cookies HTTP-only
- Hashing de senha bcrypt (10 rounds)
- Rotas API protegidas
- Verificações de autenticação via middleware em TODAS as rotas do Backoffice

**Login Padrão**: `admin@yyd.tours` / `admin123`

Ver [AUTENTICACAO.md](./AUTENTICACAO.md) para detalhes.

---

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 20+
- Banco de dados PostgreSQL
- Conta Stripe
- Chave API OpenAI

### Variáveis de Ambiente
```env
# Banco de Dados
DATABASE_URL=postgresql://...
PGHOST=...
PGUSER=...
PGPASSWORD=...
PGDATABASE=...
PGPORT=5432

# Autenticação
JWT_SECRET_KEY=sua-chave-secreta-forte-minimo-32-caracteres

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# OpenAI
OPENAI_API_KEY=sk-...

# WhatsApp (opcional)
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...

# Facebook (opcional)
FACEBOOK_PAGE_ACCESS_TOKEN=...
FACEBOOK_PAGE_ID=...
```

### Instalação
```bash
cd yyd
pnpm install
npm run prisma:gen
npm run db:push
npx tsx prisma/seed-admin.ts
pnpm dev
```

### Acesso
- **Cliente**: http://localhost:5000
- **Backoffice**: http://localhost:3001
- **Login**: admin@yyd.tours / admin123

---

## 📊 Status da Implementação

**Total de Funcionalidades**: 63  
**Completas**: 14 ✅  
**Em Progresso**: 0 🔄  
**Pendentes**: 49 ⏳  

Ver [IMPLEMENTACAO-STATUS.md](./IMPLEMENTACAO-STATUS.md) para detalhamento completo.

---

## 🛠️ Stack Tecnológica

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS (via globals.css customizado)

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Neon)
- bcryptjs + JWT

### Pagamentos
- Stripe (Checkout + Webhooks)

### IA/ML
- OpenAI GPT-4o-mini
- Engenharia de prompts customizada

### Integrações
- WhatsApp Cloud API
- Facebook Graph API
- PDFKit (vouchers)
- Geração de QRCode

---

## 📝 Fluxo de Desenvolvimento

1. **Desenvolvimento de Funcionalidades**
   - Criar branch da funcionalidade
   - Implementar com testes
   - Documentar em `/docs`
   - Atualizar IMPLEMENTACAO-STATUS.md
   - Criar PR com screenshots

2. **Padrões de Código**
   - TypeScript strict mode
   - Prisma para todas operações DB
   - Validação server-side
   - Tratamento de erros em todas APIs

3. **Documentação**
   - Atualizar docs ANTES de merge
   - Incluir exemplos de API
   - Adicionar notas de segurança
   - Atualizar changelog

---

## 🔗 Links Externos

- **Site Oficial**: https://www.yesyoudeserve.tours
- **TripAdvisor**: [Mais de 200 avaliações 5 estrelas]
- **Destaque ABC**: Good Morning America

---

## 📧 Contato

**Suporte Técnico**: Fillipe Guerra  
**Comercial**: Daniel Ponce (daniel@yyd.tours)  
**Localização**: Sintra e Cascais, Portugal  

---

**Última Atualização**: 2025-10-20  
**Versão**: 2.0.0 Produção (Em Desenvolvimento)  
**Licença**: Proprietária - Yes, You Deserve! Ltd.
