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
The client-facing platform aims for an identical visual identity to the original "yesyoudeserve.tours" website, including exact colors (Turquoise, Burgundy, Gold, Black), typography (Montserrat 700, Lato 400, Playfair Display), and components (Hero Section, Trustindex, Awards, Video Section, Features, Stats Counter, Comparison Table, Testimonials, FAQ, Contact, Footer).

### Technical Implementations
- **Backoffice (ERP+CRM)**: Comprehensive management of products (tours), staff/guides, finance (cash flow, payroll, Stripe integration, AR/AP, reporting), CRM (customer database, timeline, segmentation, automations, communication), and integrations. All features include CRUD operations, RBAC, and audit logging. Includes a granular permissions system with 86 permissions across 11 categories.
- **Aurora IA**: An AI-driven chat system for sales and customer service across web, WhatsApp, and Facebook Messenger. It includes configurable behavior, a manageable knowledge base, and automated booking/payment processing. Aurora IA runs on port 8008, proxied through the Client app at `/api/aurora/chat`.
- **Client Platform**: A clone of the existing website with full tour descriptions, correct seasonal/per-person pricing, a complete booking flow (including optional extras, payment processing via Stripe, and voucher generation), and a passwordless client area for managing bookings.
- **Products**: CRUD for tours, optional activities, seasonal/group pricing, multi-language support (EN/PT/ES), blackout dates, configurable tour durations, monuments, min/max activities, activity types, and "All-Inclusive" packages.
- **People**: CRUD for staff and guides, certifications, languages, schedules, photos, bios, and role-based access control. Guides have a dedicated interface for managing assigned tours, including approval, rejection, transfer, and notes.
- **Finance**: Double-entry ledger, payroll management (including Stripe Connect for staff payments), Stripe integration with automatic reconciliation, AR/AP, IVA/profit/cash flow reports. The system handles all financial transactions in BRL (Brazilian Real).
- **CRM**: Customer database with profiles, interaction history, segmentation, lead funnel, automated lead scoring, direct communication tools, and CRM automations.
- **Integrations**: CRUD for managing Stripe, WhatsApp Cloud API, Facebook Messenger, OpenAI, and SMTP, with connection testing and logging.
- **Aurora IA Management**: Configuration of Aurora's tone, active languages, operating hours, out-of-hours messages, automated responses, and knowledge base.
- **Notification System**: In-app notifications and emails for tour assignments, auto-approval (1-hour window), 48-hour rejection rule, and payment processing.
- **Email System**: Staff-only email management with inbox/sent/trash folders and departmental emails.

### System Design Choices
- **Authentication**: JWT for secure access, with session cookies that expire when the browser/tab closes.
- **Data Handling**: PostgreSQL with Prisma ORM and pgvector for vector embeddings.
- **Job Queues**: Bull for handling asynchronous tasks like emails.
- **API Design**: RESTful APIs for backoffice functionalities and Aurora configuration. Next.js Server Actions employ an environment-driven allowlist for security.
- **AI Architecture**: Affective Mathematics (VAD), 7-Layer Memory model, Hybrid RAG scoring, Progressive Autonomy (0.85 confidence threshold), and a keyword fallback for knowledge base.
- **Financial System**: Implements a comprehensive double-entry accounting system with a `Transaction` model and `LedgerEntry` enhancements. All accounting operations are wrapped in `prisma.$transaction` for atomicity.

## External Dependencies
- **Database**: PostgreSQL with pgvector
- **Payments**: Stripe (with webhook integration and Stripe Connect)
- **Messaging**: Twilio (for WhatsApp), Facebook Messenger API
- **AI**: OpenAI (optional fallback for Aurora IA)
- **Email**: Replit Mail
- **Job Queues**: Bull

## Recent Changes

### Dashboard Security Fix (October 23, 2025)
- **Critical Bug Fixed**: Unauthenticated access to admin dashboard
  - **Problem**: Direct URL access bypassed login requirement + browser cache
  - **Solutions Implemented**:
    1. Force dynamic rendering: `export const dynamic = 'force-dynamic'` in `app/page.tsx`
    2. Cache control headers in middleware: `Cache-Control: no-store, no-cache`
    3. Session cookie (no maxAge) - expires when browser/tab closes
    4. Logout endpoint clears cookie with `maxAge: 0`
  - **Verification**: Server returns HTTP 307 redirect when no valid cookie
  - **Files**: `app/page.tsx`, `middleware.ts`, `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`
  - **Testing**: Use incognito/anonymous mode or clear browser cache (Ctrl+Shift+Delete)

### Unified Financial Management Page (October 23, 2025)
- **Complete Financial Overview Integration**:
  - `/financial` Overview tab now shows EVERYTHING in one view
  - Summary cards: Receita Total, Despesas Totais, Posição Líquida, Saldo Pendente
  - **Transaction history integrated directly** - no separate page needed
  - Filter tabs: Todas | Receitas | Despesas
  - Transaction summary mini-cards show real-time totals
  - Complete transaction table with all details:
    * Date, Type, Category, Description, Source/Beneficiary, Amount
    * Visual badges: 🎫 Tour, 👤 Salário, 🏢 Fornecedor, 💵 Recebível
    * Color-coded: +R$ (green) income, -R$ (red) expenses
    * Real-time filtering without page reload
  
- **API Improvements**:
  - `/api/financial/transactions` unifies ALL financial data sources:
    * Stripe Payments (tour sales)
    * Transaction records (salary payments)
    * AccountsPayable (vendor payments)
    * AccountsReceivable (other income)
  - `/api/financial/reconciliation` correctly includes Transaction.type='payment_out' in expenses
  - All financial data now consistent across all views