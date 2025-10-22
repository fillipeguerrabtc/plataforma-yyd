# YYD Platform - Yes You Deserve

## Overview
The YYD Platform is a complete premium electric tuk-tuk tour booking system for "Yes You Deserve," operating in Sintra/Cascais, Portugal. It functions as a production-ready ERP+CRM+IA solution designed to manage tours, bookings, customer interactions, and all core business operations. The platform aims to be a comprehensive business management tool.

## User Preferences
- No mock data: Everything must be real
- No MVP: Build COMPLETE platform, not incremental
- Direct communication: User provides specific instructions
- Token economy: User brings specifications, agent executes
- Professional execution: Read everything completely, absorb knowledge, no superficial work

## System Architecture

### UI/UX Decisions
The client-facing platform aims for an identical visual identity to the original "yesyoudeserve.tours" website. This includes:
- **Exact Colors**: Turquoise (#1FB7C4 or #37C8C4), Burgundy (#7E3231), Gold (#E9C46A), Black (#1A1A1A).
- **Exact Typography**: Montserrat 700 (titles), Lato 400 (body), Playfair Display (display).
- **Exact Components**: Hero Section, Trustindex, Awards, Video Section, Features, Stats Counter, Comparison Table, Testimonials, FAQ, Contact, Footer.

### Technical Implementations
- **Backoffice (ERP+CRM)**: Comprehensive management of products (tours), staff/guides, finance (cash flow, payroll, Stripe integration, AR/AP, reporting), CRM (customer database, timeline, segmentation, automations, communication), and integrations. All features include CRUD operations, RBAC, and audit logging.
- **Aurora IA**: An AI-driven chat system for sales and customer service across web, WhatsApp, and Facebook Messenger. It includes configurable behavior, a manageable knowledge base, and automated booking/payment processing.
- **Client Platform**: A clone of the existing website with full tour descriptions, correct seasonal/per-person pricing, a complete booking flow (including optional extras, payment processing via Stripe, and voucher generation), and a passwordless client area for managing bookings.

### Feature Specifications
- **Products**: CRUD for tours, optional activities, seasonal/group pricing, multi-language support (EN/PT/ES), blackout dates.
- **People**: CRUD for staff and guides, certifications, languages, schedules, photos, bios, and role-based access control (Admin, Manager, Guide, Staff).
- **Finance**: Double-entry ledger, payroll management (fixed staff, guides, vendors), Stripe integration with automatic reconciliation, AR/AP, IVA/profit/cash flow reports.
- **CRM**: Customer database with profiles, interaction history, segmentation (value, frequency, origin), lead funnel, automated lead scoring, direct communication tools, and CRM automations (post-tour emails, birthday discounts, reminders, re-engagement, upsell).
- **Integrations**: CRUD for managing Stripe, WhatsApp Cloud API, Facebook Messenger, OpenAI, and SMTP, with connection testing and logging.
- **Aurora IA Management**: Configuration of Aurora's tone, active languages, operating hours, and out-of-hours messages. Management of automated responses and a knowledge base to enhance autonomous learning.
- **Aurora IA (Sales Chat)**: Multi-channel support (web, WhatsApp, Messenger), automatic language detection, real-time tour availability, chat-based booking and payment (Stripe), automatic voucher sending, and synchronization with the backoffice calendar.

### System Design Choices
- **Authentication**: JWT for secure access.
- **Data Handling**: PostgreSQL with Prisma ORM and pgvector for vector embeddings.
- **Job Queues**: Bull for handling asynchronous tasks like emails.
- **API Design**: RESTful APIs for backoffice functionalities and Aurora configuration.
- **AI Architecture**: Affective Mathematics (VAD), 7-Layer Memory model, Hybrid RAG scoring, Progressive Autonomy (0.85 confidence threshold), and a keyword fallback for knowledge base.

## External Dependencies
- **Database**: PostgreSQL with pgvector
- **Payments**: Stripe (with webhook integration for payment confirmation)
- **Messaging**: Twilio (for WhatsApp), Facebook Messenger API
- **AI**: OpenAI (optional fallback for Aurora IA)
- **Email**: Replit Mail (automatic authentication, works in dev & production)
- **Job Queues**: Bull

## Recent Implementations (Oct 2025)

### Payment & Confirmation Flow ✅
Complete end-to-end payment confirmation system:
- **Auto-refresh confirmation page**: Polls every 3 seconds, shows success/failure/processing states
- **Booking API authorization**: 30-minute access window for unauthenticated users (post-payment)
- **Webhook handling**: Stripe webhooks confirm bookings, update payments, send emails
- **Email integration**: Replit Mail with HTML templates (EN/PT/ES) sent ONLY after payment success
- **Idempotent processing**: Double-booking protection, safe to rerun webhooks
- **Documentation**: Complete flow documented in `PAYMENT_CONFIRMATION_FLOW.md`

### Email System ✅
**Replit Mail Integration** (blueprint:replitmail):
- Automatic authentication via `REPL_IDENTITY` (dev) or `WEB_REPL_RENEWAL` (production)
- Works in BOTH development and production environments
- Professional HTML email templates with YYD branding
- Multi-language support (EN/PT/ES)
- Only accepts real email addresses (rejects `@example.com` test emails)
- Confirmation emails sent ONLY after Stripe webhook confirms payment (no duplicates)
- **Direct sending** (no queue): Emails sent synchronously in webhook handler for simplicity (removed Bull Queue/Redis dependency)

**Test Script**: `npx tsx scripts/quick-email-test.ts` to send test emails

### BI Analytics ✅
**Revenue Analytics Dashboard** (Oct 22, 2025):
- Fixed data format mismatch between backend API and frontend charts
- API now returns structured data: `{ totals, daily, byProduct }`
- Displays: Revenue Total, Average per Booking, Total Bookings
- Charts: Daily Revenue (30 days), Revenue by Tour (pie), Performance by Tour (bar)

### Stripe Payouts Documentation ✅
**Comprehensive guides created** (Oct 22, 2025):
- **STRIPE_PAYROLL_GUIDE.md**: Complete guide on using Stripe Payouts API for employee/contractor payments
- **STRIPE_PAYOUTS_TEST_MODE.md**: Testing guide with test bank account numbers, complete flow examples, and implementation code
- Covers: Payouts API, Stripe Connect, test mode, webhooks, cost structure, and production considerations

### Stripe Connect Implementation ✅
**Complete Stripe Connect integration for guide/employee payments** (Oct 22, 2025):
- **Schema updates**: Added `stripeConnectedAccountId`, `stripeAccountStatus`, `stripeAccountType`, `stripeOnboardingCompleted` to Guide model
- **Payroll tracking**: Added `stripeTransferId` and `stripePayoutId` to Payroll model
- **5 API Routes created**:
  - `/api/stripe-connect/create-account` - Create Stripe Express account for guide
  - `/api/stripe-connect/onboarding-link` - Generate onboarding URL for guide to complete setup
  - `/api/stripe-connect/login-link` - Generate login link to guide's Stripe dashboard
  - `/api/stripe-connect/transfer` - Transfer payment from platform to guide's account (validates account is active)
  - `/api/stripe-connect/balance` - Check guide's Stripe balance
- **Test Mode support**: All APIs work with Stripe test mode using test accounts
- **Complete Flow**: 
  1. Create account (creates Express account)
  2. Generate onboarding link (guide completes Stripe onboarding)
  3. Transfer funds (platform pays guide - validates account is active first)
  4. Guide logs in to dashboard (views balance)
  5. Guide makes payout to bank account

### Security & RBAC Enhancement ✅
**Granular permission system and security hardening** (Oct 22, 2025):
- **RBAC Refactoring**: Migrated from generic `requireResourceAccess()` to granular `requirePermission(resource, action)` with specific actions (create/read/update/delete)
- **New User Roles**: Added 'manager' and 'staff' roles to UserRole enum in Prisma schema
- **New Resource Type**: Added 'staff' as separate resource type distinct from 'users' in RBAC permissions
- **Chat System Logic**: Guides can send messages to ANY department (broadcast only), Staff can send to ANY department OR specific users (individual/group)
- **Guide Active Status**: Booking approval endpoints now verify guide.active status before allowing approval/rejection
- **Universal Permissions**: All 20+ API endpoints now use action-level authorization (create/read/update/delete) ensuring proper role-based access control
- **Audit Logging**: All permission denials are logged with user ID, resource, action, and request details for security monitoring