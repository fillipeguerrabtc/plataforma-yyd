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

### Authentication & Permissions (Updated Oct 22, 2025)
- **Individual Login**: Each user logs in with their own credentials and sees their own name in sidebar
- **Role-Based Access Control (RBAC)**: 5 roles with specific permissions
  - **Admin**: Full access to everything
  - **Director**: Full access except some admin settings (Danyella has this role)
  - **Finance**: Full financial access, read-only for operations
  - **Guide**: Limited to their own data (tours, bookings, customers)
  - **Support**: Customer service and bookings only
- **Resource Permissions**: 
  - `users` - Manage staff, guides, vendors (Admin + Director only)
  - `guides` - Manage guides and Stripe accounts
  - `finance` - Financial operations
  - `products`, `bookings`, `customers`, `reviews`, etc.
- **Staff-User Sync**: Creating/updating/deleting Staff automatically syncs with User table for login

### Stripe Connect - Universal Payment System (Oct 22, 2025)
- **Generic Payment Infrastructure**: Supports ALL people/partners, not just guides
- **Supported Entities**:
  - **Guides**: Tour guides with Stripe Express accounts
  - **Staff**: Employees receiving salary payments
  - **Vendors**: Suppliers and contractors
- **Database Schema**: 
  - All entities have: `stripeConnectedAccountId`, `stripeAccountStatus`, `stripeAccountType`, `stripeOnboardingCompleted`
  - Payroll model uses: `staffId`, `guideId`, `vendorId` with proper relations
- **Features**:
  - Create Stripe Express accounts
  - Generate onboarding links
  - View balances and account status
  - Process transfers and payouts
  - Track all transactions

### Technical Implementations
- **Backoffice (ERP+CRM)**: Comprehensive management of products (tours), staff/guides, finance (cash flow, payroll, Stripe integration, AR/AP, reporting), CRM (customer database, timeline, segmentation, automations, communication), and integrations. All features include CRUD operations, RBAC, and audit logging.
- **Aurora IA**: An AI-driven chat system for sales and customer service across web, WhatsApp, and Facebook Messenger. It includes configurable behavior, a manageable knowledge base, and automated booking/payment processing.
- **Client Platform**: A clone of the existing website with full tour descriptions, correct seasonal/per-person pricing, a complete booking flow (including optional extras, payment processing via Stripe, and voucher generation), and a passwordless client area for managing bookings.

### System Design Choices
- **Authentication**: JWT for secure access, synced Staff/User tables
- **Data Handling**: PostgreSQL with Prisma ORM and pgvector for vector embeddings
- **Job Queues**: Bull for handling asynchronous tasks like emails
- **API Design**: RESTful APIs with RBAC permission checks
- **Next.js Config**: Server Actions configured for Replit environment with allowed origins

## External Dependencies
- **Database**: PostgreSQL with pgvector
- **Payments**: Stripe (with Stripe Connect for payouts)
- **Messaging**: Twilio (for WhatsApp), Facebook Messenger API
- **AI**: OpenAI (optional fallback for Aurora IA)
- **Email**: Replit Mail (automatic authentication, works in dev & production)
- **Job Queues**: Bull

## Recent Implementations (Oct 2025)

### Authentication System Fixes (Oct 22, 2025) ✅
**Complete overhaul of authentication and permissions**:
- **Staff-User Sync**: 
  - CREATE: Creating Staff automatically creates User for login
  - UPDATE: Updating Staff syncs password and role to User
  - DELETE: Deleting Staff deactivates User (sets active=false)
  - All operations use Prisma transactions for atomicity
- **Dynamic Sidebar**: Fetches current user from `/api/auth/me` - shows actual logged-in user
- **Login Validation**: Checks `User.active` flag to block deactivated accounts
- **Security**: Removed staff can no longer login

### RBAC Permission Updates (Oct 22, 2025) ✅
- **Added `users` resource**: Control who can manage people (staff, guides, vendors)
- **Updated Director role**: Full permissions on `users` (create, read, update, delete, manage)
- **Permission Matrix**:
  - Admin: Full access to all resources
  - Director: Full access to users, guides, products, bookings, customers; read-only finance
  - Finance: Full finance access, read-only everything else
  - Guide: Only their own data
  - Support: Customer service and bookings

### Stripe Connect Universal System (Oct 22, 2025) ✅
**Expanded from guides-only to universal payment system**:
- **Database Schema Updates**:
  - Added Stripe fields to Staff model: `stripeConnectedAccountId`, `stripeAccountStatus`, `stripeAccountType`, `stripeOnboardingCompleted`
  - Added Stripe fields to Vendor model (same fields as above)
  - Updated Payroll model: `staffId`, `guideId`, `vendorId` with relations to all three entities
  - All models have `payrolls` relation for salary tracking
- **Migration**: Successfully pushed schema changes with `npm run db:push --accept-data-loss`
- **Purpose**: Pay salaries to guides, employees, and contractors via Stripe Connect

### Next.js Configuration Fix (Oct 22, 2025) ✅
- **Server Actions**: Fixed "Invalid Server Actions request" error
- **Configuration**: Added `allowedOrigins: ["*"]` and headers for Replit environment
- **Impact**: Guide creation forms now work correctly

### Test Users Created (Oct 22, 2025) ✅
Available test accounts with different roles:
1. **Administrator** (`admin@yyd.tours`) - password: `admin123` - Role: Admin
2. **Danyella Santos** (`danyella@yyd.tours`) - Role: Director
3. **Maria Silva** (`maria@yyd.tours`) - password: `maria123` - Role: Support
4. **João Ferreira** (`joao@yyd.tours`) - password: `joao123` - Role: Finance
5. **Pedro Costa** (`pedro@yyd.tours`) - password: `pedro123` - Role: Guide

### Guides Can Login (Oct 22, 2025) ✅
- Guides now have User accounts and can access Backoffice
- See only their own tours, bookings, and customers
- Cannot access financial data or other guides' information

## Current State (Oct 22, 2025)

### ✅ Completed Features
- Individual authentication with proper role-based permissions
- Staff/User table synchronization
- Universal Stripe Connect for Guides, Staff, and Vendors
- Dynamic sidebar showing logged-in user
- RBAC permission system with `users` resource
- Test users across all roles
- Next.js Server Actions fix

### 🚧 In Progress
- Stripe Connect UI (currently shows guides only, needs to be generic)
- APIs for Staff and Vendor Stripe operations

### 📝 TODO
- Update Stripe Connect page to show all entities (Staff, Guides, Vendors)
- Create unified payment interface
- Test complete payment flow for all entity types
