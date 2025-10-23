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

### Service Management
- **Aurora IA**: Service runs on port 8008, proxied through Client app at `/api/aurora/chat`
- **Workflow Configuration**: Aurora, Backoffice (port 3001), and Client workflows properly configured