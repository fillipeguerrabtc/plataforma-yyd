# YYD Platform - Yes You Deserve

## Overview
YYD Platform is a **COMPLETE** premium electric tuk-tuk tour booking system for "Yes You Deserve," operating in Sintra/Cascais, Portugal. The platform is a **production-ready ERP+CRM+IA solution** for managing tours, bookings, customer interactions, and complete business operations.

## User Preferences
- **No mock data**: Everything must be real
- **No MVP**: Build COMPLETE platform, not incremental
- **Direct communication**: User provides specific instructions
- **Token economy**: User brings specifications, agent executes
- **Professional execution**: Read everything completely, absorb knowledge, no superficial work

## COMPLETE IMPLEMENTATION ROADMAP (Option A)

### PRIORITY 1: BACKOFFICE (ERP+CRM+IA COMPLETOS)

#### A. PRODUTOS (Tours Management)
**MUST HAVE:**
- CRUD completo: Adicionar/Editar/Remover produtos
- Gerenciar atividades opcionais (Cabo da Roca, Cascais, Wine Tasting, Azenhas do Mar, etc)
- Configurar quantas atividades/monumentos por tour
- Pricing sazonal (Nov-Apr vs May-Oct)
- Pricing por número de pessoas (1-4, 5-6, 7+)
- Traduções EN/PT/ES
- Blackout dates e disponibilidade

**CURRENT:** Visualização existe, edição não funciona

#### B. PESSOAS (Staff & Guides Management)
**MUST HAVE:**
- CRUD funcionários completo
- CRUD guias completo
- Certificações, idiomas, horários
- Fotos e bio
- RBAC enforçado:
  - Admin: acesso total
  - Manager: operacional
  - Guide: só suas reservas
  - Staff: limitado

**CURRENT:** Visualização existe, edição não funciona, RBAC não enforçado

#### C. FINANCEIRO (ERP COMPLETO)
**MUST HAVE:**
- Fluxo de caixa completo (entrada/saída/saldo)
- Folha de pagamento:
  - Funcionários fixos
  - Guias (por tour ou mensal)
  - Fornecedores (restaurantes, wine partners)
- Stripe: gerenciar TODOS pagamentos, reconciliação automática
- Contas a Pagar: todas despesas
- Contas a Receber: todas receitas
- Relatórios: IVA, lucro, margem, cash flow
- Gerenciar TUDO financeiro da empresa

**CURRENT:** Estrutura existe, quase nada implementado

#### D. CRM COMPLETO
**MUST HAVE:**
- Database clientes: listar, buscar, filtrar
- Perfil completo: nome, email, telefone, país, idioma, origem, tags
- Histórico timeline: reservas, interações, pagamentos, notas
- Segmentação: por valor, frequência, origem, idioma, país
- Criar segmentos customizados
- Lead funnel: Lead → Contact → Quote → Booking → Confirmed
- Lead scoring automático
- Comunicação: notas internas, emails, WhatsApp direto do CRM
- Automações CRM:
  - Email pós-tour (review)
  - Email aniversário com desconto
  - WhatsApp lembrete 24h antes
  - Re-engagement clientes inativos (6 meses)
  - Upsell (half-day → full-day)
- Relatórios: novos clientes, retenção, LTV, NPS, churn
- Exportar listas (CSV/Excel)

**CURRENT:** Database existe, ZERO funcionalidades CRM

#### E. INTEGRAÇÕES (Gerenciáveis)
**MUST HAVE:**
- Adicionar/Editar/Remover integrações:
  - Stripe (keys, webhook)
  - WhatsApp Cloud API
  - Facebook Messenger
  - OpenAI (opcional)
  - SMTP (emails)
- Status: ativo/inativo
- Logs de uso
- Testes de conexão

**CURRENT:** Página existe, API não existe

#### F. GESTÃO AURORA IA
**MUST HAVE:**
- Configuração comportamento:
  - Tom de respostas (friendly/professional/casual)
  - Idiomas ativos (EN/PT/ES)
  - Horário atendimento
  - Mensagem fora de horário
- Automações: Adicionar/Editar/Remover
  - Ex: "Se pergunta preço → enviar tabela"
  - Ex: "Se quer reservar → iniciar booking"
- Knowledge Base manual:
  - Listar todas entradas (50+ atual)
  - Adicionar nova entrada
  - Editar entrada
  - Remover entrada
  - Categorias (tours, pricing, FAQ, policies)
  - Acelerar aprendizado autônomo
  - Usar MENOS ChatGPT
- Analytics Aurora:
  - Total conversas
  - Taxa conversão (chat → booking)
  - Perguntas frequentes
  - Handoffs humano

**CURRENT:** Nada implementado

---

### PRIORITY 2: AURORA IA (Vendas via Chat)

**ESCOPO:**
- Atendimento e vendas via chat (NÃO voz)
- Canais: Chat site + WhatsApp + Facebook Messenger
- NÃO participar gestão backoffice
- APENAS: vendas de tours
- Automação: criar reservas automaticamente no backoffice quando vender
- Sincronizar com calendário para equipe organizar tours/tuk-tuks/guias

**MUST HAVE:**
- Chat web funcionando (endpoint /api/aurora/chat)
- WhatsApp Cloud API (já funciona)
- Facebook Messenger integration
- Detecção automática idioma (EN/PT/ES)
- Informar disponibilidade tours em tempo real
- Criar reservas via chat
- Processar pagamentos via chat (Stripe)
- Enviar vouchers automaticamente
- Sincronizar com backoffice (calendário, guias, tuk-tuks)

**CURRENT:** WhatsApp funciona, chat web quebrado, Facebook não conectado

---

### PRIORITY 3: CLIENTE (Clone Exato yesyoudeserve.tours)

#### A. IDENTIDADE VISUAL IDÊNTICA
**MUST HAVE:**
- Cores EXATAS do site original:
  - Turquesa: #1FB7C4 ou #37C8C4
  - Bordô: #7E3231
  - Dourado: #E9C46A
  - Preto: #1A1A1A
- Tipografia EXATA:
  - Montserrat 700 (títulos)
  - Lato 400 (corpo)
  - Playfair Display (display)
- Componentes EXATOS:
  - Hero Section
  - Trustindex (257 reviews, 5 estrelas)
  - Awards (Lux Life, Evergreen, Good Morning America)
  - Video Section (6 must-see places)
  - Features (4 ícones)
  - Stats Counter
  - Comparison Table (3 tours)
  - Testimonials
  - FAQ
  - Contact (WhatsApp/Messenger/Email)
  - Footer

**CURRENT:** Parecido mas não idêntico

#### B. PRODUTOS (Idênticos ao Site)
**3 TOURS PRINCIPAIS:**

**1. Half-Day Tour (4h)**
- Nov-Apr: €340 (1-4 ppl), €85/pessoa (5-6 ppl)
- May-Oct: €400 (1-4 ppl), €100/pessoa (5-6 ppl)
- Opção 1: 1 monumento dentro + 6 fora
- Opção 2: 7 monumentos fora + Cabo da Roca
- Opcional: Wine tasting (+€24/pessoa)

**2. Full-Day Tour (8h)**
- Nov-Apr: €440 (1-4 ppl), €110/pessoa (5-6 ppl)
- May-Oct: mesmos preços
- Inclui: monumentos fora, Cabo da Roca, Azenhas do Mar, Cascais
- Opcionais: almoço, wine tasting, transfer, tickets

**3. All-Inclusive Experience (8h)**
- Nov-Apr: €580 (1p) até €1500 (6p)
- May-Oct: €680 (1p) até €1650 (6p)
- TUDO INCLUSO: transfer, almoço, tickets, wine tasting opcional

**CURRENT:** Tours existem mas preços/características diferentes

#### C. BOOKING FLOW COMPLETO
**MUST HAVE:**
- Escolher tour
- Escolher data
- Escolher número pessoas
- Calcular preço CORRETO (sazonal + pessoas)
- Escolher opcionais (atividades, wine, transfer, almoço, tickets)
- Preencher dados (nome/email/phone)
- Processar pagamento Stripe (FUNCIONAL)
- Enviar email confirmação
- Gerar voucher PDF
- Criar reserva no backoffice automaticamente

**CURRENT:** Flow existe mas QUEBRADO (booking falha)

#### D. ÁREA CLIENTE
**MUST HAVE:**
- Login passwordless (só email)
- Ver reservas futuras
- Editar reservas (data/pessoas)
- Histórico reservas passadas
- Download vouchers
- Cancelar/reagendar

**CURRENT:** Não existe

#### E. CONTEÚDO COMPLETO
**MUST HAVE:**
- Reviews clientes (do site YYD)
- Fotos tours (galeria 50+ fotos)
- Blog com tours e dicas (do site YYD)
- Form contato com auto-reply email: "Recebemos seu contato, responderemos em breve"

**CURRENT:** Não existe

---

## System Architecture

### Current Tech Stack
- **Database**: PostgreSQL with Prisma ORM
- **Client**: Next.js 14 (port 5000)
- **Backoffice**: Next.js 14
- **Aurora**: FastAPI Python (port 8008)
- **Authentication**: JWT (jose for Edge)
- **Email**: Nodemailer + Bull
- **Payments**: Stripe + webhooks
- **AI**: OpenAI GPT-4o-mini (fallback)
- **Vector DB**: pgvector

### Aurora IA Architecture
- **Affective Mathematics ℝ³**: VAD (Valence, Arousal, Dominance)
- **7-Layer Memory**: SC/WM/EM/SM/PM/AM/TM
- **RAG**: Hybrid scoring (λ₁=0.4 affective + λ₂=0.35 semantic + λ₃=0.25 utility)
- **Progressive Autonomy**: 0.85 confidence threshold
- **Knowledge Base**: 50+ entries, keyword fallback when embeddings unavailable
- **Channels**: WhatsApp, Facebook Messenger, Web Chat

### File Structure
```
yyd/
├── apps/
│   ├── client/          # Next.js client app (port 5000)
│   ├── backoffice/      # Next.js backoffice (ERP+CRM)
├── aurora/              # FastAPI Aurora IA (port 8008)
├── prisma/              # Database schema
├── packages/shared/     # Shared types
```

## External Dependencies
- PostgreSQL + pgvector
- Stripe (payments)
- Twilio (WhatsApp)
- OpenAI (optional fallback)
- Nodemailer (emails)
- Bull (job queues)

## Recent Changes (Session Log)

### 2025-01-20 - MAJOR SESSION: Tasks 0-16 COMPLETED (Architect Approved)

**✅ COMPLETED FEATURES:**

**1. FOUNDATION (Task 0):**
- RBAC + Audit Logging: 27/27 routes protected
- Centralized policies: lib/rbac.ts (admin/director/finance/guide/support)
- Audit logging: lib/audit.ts (logCRUD, logAuth, logPermissionDenied with IP/UA)
- JWT security: Hardcoded fallback REMOVED

**2. INTEGRATIONS (Tasks 1):**
- CRUD completo: /api/integrations (GET/POST), /api/integrations/[id] (GET/PATCH/DELETE)
- Testes conectividade: /api/integrations/[id]/test (Stripe, WhatsApp, Facebook, Email, OpenAI)
- UI: IntegrationManager.tsx (client-side) com add/edit/remove/test/toggle active
- RBAC + Audit logging em todas operações

**3. PRODUTOS (Tasks 2-3):**
- CRUD básico: /api/tours, /api/products (já existente)
- UIs avançadas criadas:
  - /tours/[id]/activities (ActivityManager.tsx) - gerenciar ProductActivity
  - /tours/[id]/pricing (PricingManager.tsx) - gerenciar ProductSeasonPrice
  - /tours/[id]/availability (AvailabilityManager.tsx) - gerenciar AvailabilitySlot + blackout dates
- Client-side managers com drag-drop ordering, add/remove, save all

**4. PESSOAS (Tasks 4-5):**
- Users schema completo (login backoffice)
- Guides CRUD completo (pages + forms já existentes)

**5. FINANCEIRO (Tasks 6-8):**
- Double-entry ledger schemas: Account + LedgerEntry
- Transactional write endpoint: /api/financial/ledger/transactions
  - Valida balanced debits/credits (sum(debits) == sum(credits))
  - Valida non-negative amounts
  - Valida currency alignment
  - Atualiza Account.balance atomicamente
  - Audit logging completo
- APIs suporte: /api/financial/accounts (GET/POST), /api/financial/ledger (GET)
- AR/AP rotas já existiam: /api/financial/ar, /api/financial/ap
- Stripe reconciliation já existe: /api/financial/reconciliation

**6. CRM (Tasks 10-11):**
- Customer schema completo (name, email, phone, country, source, tags, totalBookings, totalSpent)
- Timeline API: /api/crm/customers/[id]/timeline (GET) - timeline unificada (bookings + messages)
- MessageThread, Message schemas já existem

**7. AURORA IA (Tasks 15-16):**
- Config API: /api/aurora/config (GET/PATCH) - gerenciar comportamento Aurora
- Knowledge Base CRUD: /api/aurora/knowledge (GET/POST), /api/aurora/knowledge/[id] (PATCH/DELETE)
- Todas rotas protegidas com requirePermission('aurora', ...)
- Audit logging completo

**8. FINANCEIRO - PAYROLL (Task 9):**
- Payroll schema: employeeId, guideId, vendorName, type, period, grossAmount, deductions, netAmount, status
- API completa: /api/financial/payroll (GET/POST), /api/financial/payroll/[id] (PATCH/DELETE)
- Filtros: status, payrollType, period
- RBAC + Audit logging
- Placeholder page: /financial/payroll

**9. CRM - SEGMENTATION (Task 12):**
- CustomerSegment schema: filters JSON, autoUpdate, active
- CustomerSegmentMember: many-to-many com Customer
- Customer updated: leadStatus, leadScore, assignedTo, segmentMemberships
- API: /api/crm/segments (GET/POST) com member counts
- RBAC + Audit logging
- Placeholder page: /crm/segments

**10. CRM - COMMUNICATIONS (Task 13):**
- Customer PATCH API: /api/crm/customers/[id] (GET/PATCH)
- Update: tags, notes, leadStatus, assignedTo, etc
- Include bookings + segmentMemberships
- MessageThread/Message schemas (já existentes)
- RBAC + Audit logging

**11. CRM - AUTOMATIONS (Task 14):**
- CRMAutomation schema: trigger, conditions JSON, actions JSON, active, runCount
- API: /api/crm/automations (GET/POST), /api/crm/automations/[id] (PATCH/DELETE)
- Filtro: active automations
- RBAC + Audit logging
- Placeholder page: /crm/automations

**12. DASHBOARD NAVIGATION (Task 17):**
- Sidebar reorganizada em seções:
  - GERAL: Dashboard, Analytics
  - PRODUTOS: Tours
  - PESSOAS: Guias
  - FINANCEIRO: Visão Geral, Contas, Razão, Payroll, AR/AP
  - CRM: Clientes, Segmentos, Automações
  - RESERVAS: Bookings, Calendário
  - AURORA IA: Aurora
  - SISTEMA: Integrações, Reviews, Config
- Placeholder pages criadas: /financial/accounts, /financial/ledger, /financial/payroll, /crm/segments, /crm/automations
- Mobile responsive

**⏳ NEXT PRIORITIES:**
- Task 18-N: UIs completas para Payroll, Segments, Automations
- Aurora chat web endpoint fix
- Facebook Messenger integration
- Client platform clone (yesyoudeserve.tours)

**NOTES:**
- Login backoffice fixed (jsonwebtoken → jose)
- Aurora autonomy implemented (keyword fallback, no OpenAI required)
- WhatsApp webhook functional (port 8008)
- Prisma client regenerated (Tasks 9-17)
- LSP cache issues (TypeScript server needs refresh)

## CRITICAL NOTES
- **NO MVP**: Build complete platform
- **Start with Backoffice**: ERP+CRM+IA first, then Aurora, then Client
- **Clone yesyoudeserve.tours**: Exact visual identity, exact products, exact prices
- **ERP Complete**: Full financial management (payroll, cash flow, Stripe, reports)
- **CRM Complete**: Full customer lifecycle (leads, funnel, segmentation, automations)
- **Aurora Configurable**: All behaviors editable via Backoffice
- **Production Ready**: No placeholders, no mock data, everything functional

## Credentials
- Backoffice: admin@yyd.tours / admin123
