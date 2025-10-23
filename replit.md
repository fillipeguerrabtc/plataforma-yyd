# YYD Platform - Yes You Deserve

## Overview
The YYD Platform is a premium electric tuk-tuk tour booking system for "Yes You Deserve," operating in Sintra/Cascais, Portugal. It functions as a production-ready ERP+CRM+IA solution designed to manage tours, bookings, customer interactions, and all core business operations. The platform aims to be a comprehensive business management tool with a focus on business vision, market potential, and project ambitions.

## User Preferences
- No mock data: Everything must be real
- No MVP: Build COMPLETE platform, not incremental
- Direct communication: User provides specific instructions
- Token economy: User brings specifications, agent executes
- Professional execution: Read everything completely, absorb knowledge, no superficial work

## System Architecture

### UI/UX Decisions
The client-facing platform aims for an identical visual identity to the original "yesyoudeserve.tours" website. This includes exact colors (Turquoise, Burgundy, Gold, Black), exact typography (Montserrat 700, Lato 400, Playfair Display), and exact components (Hero Section, Trustindex, Awards, Video Section, Features, Stats Counter, Comparison Table, Testimonials, FAQ, Contact, Footer).

### Technical Implementations
- **Backoffice (ERP+CRM)**: Comprehensive management of products (tours), staff/guides, finance (cash flow, payroll, Stripe integration, AR/AP, reporting), CRM (customer database, timeline, segmentation, automations, communication), and integrations. All features include CRUD operations, RBAC, and audit logging.
- **Aurora IA**: An AI-driven chat system for sales and customer service across web, WhatsApp, and Facebook Messenger. It includes configurable behavior, a manageable knowledge base, and automated booking/payment processing.
- **Client Platform**: A clone of the existing website with full tour descriptions, correct seasonal/per-person pricing, a complete booking flow (including optional extras, payment processing via Stripe, and voucher generation), and a passwordless client area for managing bookings.

### Feature Specifications
- **Products**: CRUD for tours, optional activities, seasonal/group pricing, multi-language support (EN/PT/ES), blackout dates.
- **People**: CRUD for staff and guides, certifications, languages, schedules, photos, bios, and role-based access control (Admin, Manager, Guide, Staff).
- **Finance**: Double-entry ledger, payroll management, Stripe integration with automatic reconciliation, AR/AP, IVA/profit/cash flow reports.
- **CRM**: Customer database with profiles, interaction history, segmentation, lead funnel, automated lead scoring, direct communication tools, and CRM automations.
- **Integrations**: CRUD for managing Stripe, WhatsApp Cloud API, Facebook Messenger, OpenAI, and SMTP, with connection testing and logging.
- **Aurora IA Management**: Configuration of Aurora's tone, active languages, operating hours, out-of-hours messages, automated responses, and knowledge base.
- **Aurora IA (Sales Chat)**: Multi-channel support, automatic language detection, real-time tour availability, chat-based booking and payment, automatic voucher sending, and synchronization with the backoffice calendar.
- **Granular Permissions System**: 86 permissions across 11 categories with Administrator role for management. User and department specific read/write permissions with inheritance.
- **Product Configuration**: Configurable tour durations, monuments, min/max activities, activity types (activity/extra/monument), and "All-Inclusive" package options.
- **Notification System**: In-app notifications and emails for tour assignments, auto-approval (1-hour window), 48-hour rejection rule, and payment processing.
- **Email System**: Staff-only email management with inbox/sent/trash folders and departmental emails.

### System Design Choices
- **Authentication**: JWT for secure access.
- **Data Handling**: PostgreSQL with Prisma ORM and pgvector for vector embeddings.
- **Job Queues**: Bull for handling asynchronous tasks like emails.
- **API Design**: RESTful APIs for backoffice functionalities and Aurora configuration.
- **AI Architecture**: Affective Mathematics (VAD), 7-Layer Memory model, Hybrid RAG scoring, Progressive Autonomy (0.85 confidence threshold), and a keyword fallback for knowledge base.

## External Dependencies
- **Database**: PostgreSQL with pgvector
- **Payments**: Stripe (with webhook integration)
- **Messaging**: Twilio (for WhatsApp), Facebook Messenger API
- **AI**: OpenAI (optional fallback for Aurora IA)
- **Email**: Replit Mail
- **Job Queues**: Bull

## Recent Changes (October 2025)

### Guide Login & Tour Management System
- **Guide Authentication**: 
  - Added `passwordHash` field to Guide model for secure login
  - Login endpoint (`/api/auth/login`) supports both Staff (Users table) and Guides
  - JWT tokens include `userType` field to differentiate guide vs staff sessions
  
- **Guide Tour Management Interface** (`/my-tours`):
  - Guides can view all their assigned upcoming tours
  - Approve/reject tour assignments within 1-hour window
  - Auto-approval after 1 hour via `/api/guide/auto-approve-tours` endpoint
  - Transfer tours to other guides with observations
  - Add notes/observations to tours
  
- **Guide-Specific APIs**:
  - `/api/guide/my-tours` - List guide's assigned tours
  - `/api/guide/approve-tour` - Approve/reject tour assignments
  - `/api/guide/transfer-tour` - Transfer tour to another guide
  - `/api/guide/list-guides` - Minimal guide list for transfers (no RBAC required)
  - `/api/guide/auto-approve-tours` - Auto-approve tours after 1 hour timeout
  
- **Guide Access Controls**:
  - Guides have access to: My Tours, Calendar (filtered), and Internal Chat
  - Sidebar shows limited menu based on `userType='guide'`
  - Guides cannot access full booking management, only their assigned tours
  - All guide APIs verify `userType` and restrict access to guide's own tours

### Financial System Bug Fixes & Data Integrity
- **Stripe Webhook Ledger Entries**: Fixed critical bug where ledger entry creation failed with "Argument transactionId is missing" error
  - Now creates Transaction record first before LedgerEntry records
  - Proper double-entry accounting maintained (Debit Stripe, Credit Tour Sales)

- **Payment Record Creation (CRITICAL)**: Fixed major bug where Stripe webhook used `updateMany` instead of upsert
  - Problem: 8 confirmed bookings had only 3 Payment records in database
  - Old behavior: Webhook assumed Payment record was created by create-intent endpoint
  - New behavior: Webhook checks if Payment exists; if not, creates it (edge case handling)
  - Data Migration: Created 5 missing Payment records for confirmed bookings
  - Result: Corrected revenue from €1220 to actual €5116 (all 8 confirmed bookings now have payments)
  
- **Financial Data Consistency**: All dashboards now show consistent data across Dashboard, BI Analytics, and Payments screens
  - Total bookings: 10
  - Confirmed bookings: 8
  - Total payments: 8
  - Total revenue: €5116

### Security & RBAC Updates
- **Server Actions Security**: Implemented environment-driven allowlist for Next.js Server Actions to prevent CSRF vulnerabilities. Configuration now uses:
  - `REPLIT_DEV_DOMAIN` for development (automatic)
  - `BACKOFFICE_ALLOWED_ORIGINS` for production (comma-separated list of allowed origins)
  - Never use wildcard (`*`) in production
  
- **Departments RBAC**: Added `departments` resource to permission matrix:
  - Admin: Full manage permissions
  - Director: Create, read, update, manage
  - Manager/Finance/Support/Staff: Read-only access
  - Guide: No access
  - Users must logout/login after RBAC changes to refresh permissions

### UX Improvements
- **Profile Photo Size**: Reduced all profile photo display sizes from 32px to 16px (50% reduction) for better proportions
- **Email Pre-fill**: Staff creation form now pre-fills email with `@yyd.tours` to guide users toward correct format
- **WhatsApp Multilingual**: Confirmed automatic language detection (EN/PT/ES) via browser settings
- **Password Fields**: Added password fields to guide creation/edit forms (optional on create, optional on update)

### Stripe Connect Integration
- **User Model Update**: Added Stripe Connect fields to User model (staff):
  - `stripeConnectedAccountId` (unique) - Stripe account ID for receiving payments
  - `stripeAccountStatus` - Current status of connected account
  - `stripeOnboardingCompleted` - Whether onboarding is complete
- **Staff Payment Integration**: Staff members can now receive payments via Stripe Connect
  - Stripe Account ID field added to staff edit forms
  - API endpoints updated to persist Stripe Connect data for both Staff and User tables
  - Direct transfer endpoint (`/api/stripe-connect/direct-transfer`) for manual payments
- **Payments Interface**: New modern payment interface at `/finance/stripe-connect`:
  - Clean UI focused solely on making transfers
  - Supports payments to Staff, Guides, and Vendors
  - Transfer history with detailed transaction logs
  - Real-time balance updates in both YYD and beneficiary Stripe dashboards

### Currency Migration (October 23, 2025)
- **Complete EUR → BRL Migration**: Migrated entire platform from Euro (EUR/€) to Brazilian Real (BRL/R$)
  - **Reason**: Aligning with Brazilian Stripe test accounts (YYD and employee accounts) to eliminate cross-border currency conversions
  - **Scope**: Client + Backoffice + Aurora IA + Database
  - **Database Conversion (Verified)**:
    - `product_season_prices`: 20 tour prices converted R$510–R$9.900 (multiplied by 6)
    - `tour_addons`: 8 addon prices converted R$90–R$240 (multiplied by 6)
    - Historical bookings preserved in original currency for audit trail
  - **Code Changes**:
    - Shared constants: `DEFAULT_CURRENCY = 'BRL'`
    - All Stripe API calls: `currency: 'brl'`
    - All Payment records: `currency: 'BRL'`
    - shared/pricing.ts: Comments and defaults updated to BRL
    - All UI displays: R$ instead of € (0 € symbols outside test scripts)
    - Financial APIs (accounts, ledger, vendors, payroll): BRL defaults
    - Email notifications and PDFs: R$ formatting
    - Aurora knowledge base: Tour prices R$2.040-9.900
  - **Validation**:
    - Database: SQL verification of all 28 price records in BRL
    - Stripe: Successful R$1.000 transfer processed without EUR conversion
    - UI: Complete removal of € symbols from production code
  - **Result**: System now operates 100% in BRL end-to-end, eliminating Stripe currency conversion errors
  - **Architect Approval**: Conversion verified functionally complete with database, API, and Stripe evidence aligned

### Authentication Security (October 23, 2025)
- **Session Cookie Fix**: Removed `maxAge` from authentication cookie
  - **Before**: Cookie persisted for 7 days even after closing browser
  - **After**: Session cookie expires when browser/tab closes
  - **Behavior**: Users must login again after closing browser (proper session-only behavior)
  - **Files**: `yyd/apps/backoffice/app/api/auth/login/route.ts`

### Double-Entry Accounting System (October 23, 2025)
- **Transaction Model Created**: New Prisma model for financial transactions
  - Fields: type, description, amount, currency (BRL default), status, reference (Stripe ID), metadata
  - 1:N relation with LedgerEntry
  - Table `transactions` created via `npm run db:push`

- **LedgerEntry Enhanced**: Updated with Transaction relation
  - Optional relation: `transaction Transaction? @relation(fields: [transactionId], references: [id])`
  - Currency default changed from EUR to BRL
  - Fields: accountId, transactionId, transactionType, debit, credit, currency, metadata

- **Chart of Accounts UI**: Fully translated to Portuguese
  - Labels: Código, Nome, Tipo, Categoria, Saldo, Lançamentos, Status, Ações
  - Types: Ativo, Passivo, Patrimônio Líquido, Receita, Despesa
  - YYD brand color (#1FB7C4) applied to action buttons

- **5 Accounting Accounts Created (BRL)**:
  - CASH (Caixa - Ativo Circulante)
  - PAYABLE-STAFF (Contas a Pagar - Passivo Circulante)
  - SALARY-EXP (Despesas com Salários - Despesa)
  - STRIPE-CASH (Stripe Account - Ativo Circulante)
  - TOUR-SALES (Tour Sales Revenue - Receita)

- **Stripe Connect Automated Accounting**:
  - Every salary transfer via `/api/stripe-connect/direct-transfer` now creates:
    1. Transaction record (type: payment_out, status: completed, reference: Stripe transfer ID)
    2. Two LedgerEntries for double-entry bookkeeping:
       - Debit: SALARY-EXP (expense increases)
       - Credit: STRIPE-CASH (asset decreases)
    3. Account balance updates (atomic with ledger entries)
  - **Atomicity**: All accounting operations wrapped in `prisma.$transaction` for all-or-nothing persistence
  - **Validation**: Required accounts (STRIPE-CASH, SALARY-EXP) validated before processing - throws error if missing
  - **Decimal Safety**: All amounts converted to strings for Prisma Decimal compatibility
  - **Error Handling**: Accounting failures throw errors (not silenced) to prevent transfers bypassing ledger
  - **Metadata**: Full tracking of beneficiary, entity type, Stripe IDs for audit and analytics

- **Production-Ready Guarantees**:
  - ✅ Zero chance of orphaned Transaction records
  - ✅ Zero chance of mismatched account balances
  - ✅ Double-entry always balanced (debit = credit)
  - ✅ All transfers appear in Finance > Accounts, Finance > Ledger, BI Analytics
  - ✅ Rollback on any failure (atomicity guaranteed)
  - **Architect Reviewed**: Approved for production with atomic transactions and mandatory validations

### Dashboard Security Fix (October 23, 2025)
- **Critical Bug Fixed**: Unauthenticated access to admin dashboard
  - **Problem**: Direct URL access to backoffice bypassed login requirement
  - **Root Cause**: `app/page.tsx` returned default 'staff' role for unauthenticated users
  - **Solution**: Created `checkAuthAndGetRole()` function that redirects to `/login` before loading any data
  - **Verification**: Auth check executes FIRST, data loads ONLY if authenticated
  - **Files**: `yyd/apps/backoffice/app/page.tsx`

### Financial Transactions System (October 23, 2025)
- **Comprehensive Transaction History**:
  - New endpoint `/api/financial/transactions` that unifies ALL financial data:
    * Stripe Payments (tour sales - income)
    * Salary Transactions via Stripe Connect (expenses)
    * Accounts Payable (vendor payments - expenses)
    * Accounts Receivable (other income)
  - Categorization: `tour_sale`, `salary`, `vendor`, `receivable`
  - Filter support: `?type=income|expense|all`
  
- **New Transaction History Page** (`/financial/transactions`):
  - Complete table showing ALL transactions (income + expenses)
  - Filter tabs: Todas | Receitas | Despesas
  - Visual badges for categories (🎫 Tour, 👤 Salário, 🏢 Fornecedor, 💵 Recebível)
  - Summary cards: Total Income, Total Expenses, Net Position, Transaction Count
  - Clear formatting: +R$ for income (green), -R$ for expenses (red)
  - Full details: Date, Type, Category, Description, Source/Beneficiary, Amount
  
- **Clickable Financial Cards**:
  - "Receita Total" and "Despesas Totais" cards now clickable in `/financial`
  - Hover effects: colored border, elevation, shadow
  - Click redirects to transaction history with filter applied
  - "Ver histórico →" text appears on hover
  
- **Expenses Calculation Fix**:
  - `/api/financial/reconciliation` now includes `Transaction.type='payment_out'` in expense totals
  - Despesas Totais now correctly shows R$1.756,87 (includes Stripe salary payments)
  - All dashboards show consistent financial data

### Service Management
- **Aurora IA**: Service runs on port 8008, proxied through Client app at `/api/aurora/chat`
- **Workflow Configuration**: Aurora, Backoffice (port 3001), and Client workflows properly configured