# 📝 Changelog - YYD Platform

All notable changes to the YYD Platform will be documented in this file.

**Format**: Based on [Keep a Changelog](https://keepachangelog.com/)  
**Versioning**: Semantic Versioning

---

## [Unreleased]

### 🚧 In Progress
- Complete Tours CRUD (pricing tiers, activities, image upload)
- Email system with nodemailer
- Customer portal with authentication
- Fleet management module
- Monument tickets API integration
- Aurora IA booking creation
- Advanced analytics with Prophet
- SEO optimization

---

## [0.2.0] - 2025-10-20

### 🔐 Added - Security & Authentication
- **RBAC Authentication System** with 5 roles (admin, director, guide, finance, support)
- **JWT-based auth** with 7-day token expiry
- **bcrypt password hashing** (10 rounds)
- **Login page** for Backoffice with YYD branding
- **Authentication middleware** protecting ALL Backoffice routes
- **Protected API routes** with role-based access control
- **User model** in Prisma schema with indexes
- **Default admin user** seeding script
- **Auth helper functions** (`requireAuth`, `getUserFromRequest`)

**Files Added**:
- `yyd/apps/backoffice/lib/auth.ts`
- `yyd/apps/backoffice/middleware.ts`
- `yyd/apps/backoffice/app/login/page.tsx`
- `yyd/apps/backoffice/app/api/auth/login/route.ts`
- `yyd/apps/backoffice/app/api/auth/logout/route.ts`
- `yyd/apps/backoffice/app/api/auth/me/route.ts`
- `yyd/prisma/seed-admin.ts`

**API Endpoints**:
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user

**Default Credentials**: `admin@yyd.tours` / `admin123`

### 🗺️ Added - Tours CRUD
- **Tours NEW form** with multilingual fields (PT/EN/ES)
- **Tours EDIT form** with data loading
- **Tours API routes** (POST, PUT, DELETE)
- **Role-based permissions** (admin/director for create/edit, admin only for delete)

**Files Added**:
- `yyd/apps/backoffice/app/tours/new/page.tsx`
- `yyd/apps/backoffice/app/tours/[id]/page.tsx`
- `yyd/apps/backoffice/components/TourForm.tsx`
- `yyd/apps/backoffice/app/api/tours/route.ts`
- `yyd/apps/backoffice/app/api/tours/[id]/route.ts`

**TODO**: Add pricing tiers, activities, and image upload

### 📄 Added - Vouchers System
- **PDF voucher generation** with YYD branding
- **QR code** for quick check-in
- **Voucher API endpoint** for download

**Files Added**:
- `yyd/apps/client/lib/generateVoucher.ts`
- `yyd/apps/client/app/api/voucher/[bookingId]/route.ts`

**Dependencies**: `pdfkit`, `qrcode`

**TODO**: Add email delivery, customer auth, YYD fonts embedding

### 🎨 Added - Brand Identity
- **Google Fonts integration**: Pacifico, Montserrat, Poppins
- **Official YYD color palette**: `#23C0E3`, `#25D366`, `#FFD700`, `#333333`
- **Circular logo** on ALL pages (Client header + Backoffice sidebar)
- **WhatsApp CTA button** in Client header
- **CSS variables** for YYD design system
- **Utility classes** for branding

**Files Modified**:
- `yyd/apps/client/app/globals.css` - YYD fonts & colors
- `yyd/apps/backoffice/app/globals.css` - YYD branding
- `yyd/apps/client/components/Header.tsx` - Logo + WhatsApp button
- `yyd/apps/backoffice/components/Sidebar.tsx` - Logo integration

**Assets Added**:
- `yyd/apps/client/public/logo.png`
- `yyd/apps/backoffice/public/logo.png`

### 📚 Added - Documentation
- **Complete documentation** in `/yyd/docs/`
- **README.md** - Platform overview
- **IMPLEMENTATION-STATUS.md** - Status of all 63 features
- **AUTHENTICATION.md** - Complete RBAC docs
- **API-REFERENCE.md** - All endpoints with examples
- **CHANGELOG.md** - This file

**Documentation Coverage**: 100% of implemented features

### 🔧 Changed
- Updated Prisma schema with `User` model and `UserRole` enum
- Regenerated Prisma Client to include auth models
- Configured Next.js middleware for route protection

### 🔒 Security
- **All Backoffice routes** now require authentication
- **Tours APIs** protected with role checks
- **JWT tokens** stored in HTTP-only cookies
- **Password validation** on login

---

## [0.1.0] - 2025-10-19

### 🎉 Initial Production Foundation

### ✅ Added - Core Infrastructure
- **Prisma ORM** setup with PostgreSQL
- **Database schema** with 7 core models
- **Monorepo structure** with pnpm workspaces
- **Next.js 14** for Client and Backoffice apps
- **TypeScript** configuration
- **Shared packages** for types and utilities

**Models**:
- `Product` - Tour products with multilingual content
- `ProductSeasonPrice` - Seasonal pricing (24 tiers)
- `Booking` - Tour reservations
- `Customer` - CRM data
- `Guide` - Drivers with certifications
- `Payment` - Stripe payment tracking
- `Integration` - External service configs

### ✅ Added - Client App (Port 5000)
- **Homepage** with hero section
- **3 tour detail pages** with real data
- **Complete booking flow**:
  1. Select date & people
  2. Customize options
  3. Enter customer info
  4. Review booking
  5. Stripe checkout
- **Confirmation page** (3 states: confirmed, pending, failed)
- **Header** with navigation
- **Footer** with contact info

**Features**:
- Seasonal pricing calculation
- Dynamic pricing based on group size
- Server-side price validation (security)
- Stripe integration

**Real Tours**:
1. Half-Day Sintra Tour (€340-400, 4h)
2. Private Full-Day Tour (€440-520, 8h) ⭐ BEST CHOICE
3. All-Inclusive Premium (€580-1650, 8h) 💎

### ✅ Added - Backoffice App (Port 3001)
- **Dashboard** with real-time stats
- **Calendar view** (monthly) with all bookings
- **Bookings management**:
  - List with filters (status, date range)
  - Detail pages with full info
  - Assign guides to bookings
- **Guides CRUD**:
  - Create, edit, list
  - Languages, certifications, availability
- **Customers CRM**:
  - List with booking history
  - Total spent, last booking
- **Financial dashboard**:
  - Total revenue
  - Monthly revenue
  - Accounts payable/receivable
  - Recent payments
- **Tours listing** page
- **Integrations** status page
- **Aurora IA** manager page

**Components**:
- Sidebar navigation
- Stats cards
- Data tables

### ✅ Added - Stripe Integration
- **Checkout API** for payment processing
- **Webhook handler** for `checkout.session.completed`
- **Automatic booking creation** on successful payment
- **Calendar event creation**
- **Payment record tracking**
- **Customer record updates**

**Security**: Server-side price recalculation (no client tampering)

### ✅ Added - Aurora IA Foundation
- **OpenAI integration** (GPT-4o-mini)
- **Multilingual support** (EN, PT, ES)
- **WhatsApp Cloud API** webhook
- **Facebook Messenger** webhook
- **Conversation storage** in database
- **System prompts** with YYD tour information

**Capabilities**:
- Respond to customer questions
- Provide tour information
- Answer in 3 languages

**TODO**: Booking creation, handoff, autonomy config

### ✅ Added - Database Seeding
- **3 real tour products** with accurate data
- **24 seasonal price tiers**:
  - Low season (Nov-Apr)
  - High season (May-Oct)
  - 4 group sizes: 1-2, 3-4, 5-6, 7-36 people
- **Sample guides** with certifications

### 📦 Dependencies
- `next@14.2.33`
- `react@18.3.0`
- `prisma@5.22.0`
- `@prisma/client@5.22.0`
- `stripe@14.x`
- `openai@4.x`
- `pdfkit@0.15.0`
- `qrcode@1.5.4`
- `bcryptjs@2.4.3`
- `jsonwebtoken@9.0.2`

### 🔧 Configuration
- **Workflows**: Client (port 5000), Backoffice (port 3001)
- **Database**: PostgreSQL (Neon)
- **Environment**: `.env` with all secrets

### 🐛 Fixed
- React import errors
- useState hook errors
- Server-side vs client-side component issues
- Prisma client generation

---

## Migration from Previous Version

### Breaking Changes
- Removed mock data patterns
- Removed telemetry system
- Removed proxy SDK
- Reset to clean foundation

### Database Changes
- Fresh Prisma schema
- All new migrations
- Seeded with real data

---

## Security Notes

### Fixed
- ✅ Server-side price validation (no client tampering)
- ✅ Stripe webhook signature verification
- ✅ RBAC authentication system
- ✅ JWT token security
- ✅ bcrypt password hashing
- ✅ Protected API routes

### Pending
- ⚠️ Customer authentication (voucher downloads)
- ⚠️ Rate limiting
- ⚠️ CSRF protection
- ⚠️ Input sanitization
- ⚠️ SQL injection prevention (using Prisma helps)

---

## Known Issues

### LSP Errors (Non-blocking)
- Prisma client cache issues (resolved by restart)
- Type import errors (IDE only)

### Missing Features
See [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) for complete list.

---

## Contributors

- **Fillipe Guerra** - Technical Implementation
- **Daniel Ponce** - Business Requirements & Brand Identity

---

**File Location**: `/yyd/docs/CHANGELOG.md`  
**Last Updated**: 2025-10-20  
**Format**: [Keep a Changelog](https://keepachangelog.com/)
