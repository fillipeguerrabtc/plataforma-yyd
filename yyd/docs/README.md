# 🚀 YYD Platform - Yes, You Deserve! (v2.0 Production)

**Premium Electric Tuk-Tuk Tour Platform** for Sintra & Cascais, Portugal

**Founded by**: Daniel Ponce  
**Featured on**: ABC Good Morning America  
**Reviews**: 200+ 5-star TripAdvisor reviews  

---

## 📚 Documentation Index

This `/docs` folder contains **COMPLETE** technical documentation for the YYD platform:

### Core Documentation
- **[IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)** - Current status of ALL 63 production features
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete technical architecture
- **[API-REFERENCE.md](./API-REFERENCE.md)** - All API endpoints with examples
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - RBAC authentication system
- **[CHANGELOG.md](./CHANGELOG.md)** - Complete change history

### Additional Resources
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Local development setup
- **[TESTING.md](./TESTING.md)** - Testing strategy and QA
- **[SECURITY.md](./SECURITY.md)** - Security best practices

---

## 🎯 Platform Overview

### Three Core Modules

#### 1️⃣ **Client App** (Port 5000)
Public-facing website where customers:
- Browse 3 real tours (Half-Day €340-400, Full-Day €440-520, All-Inclusive €580-1650)
- Complete booking flow with seasonal pricing
- Pay securely via Stripe
- Receive automatic PDF vouchers
- Chat with Aurora IA

**Tech Stack**: Next.js 14, Stripe, Tailwind CSS, PostgreSQL

#### 2️⃣ **Backoffice App** (Port 3001)
Admin ERP/CRM system with:
- Dashboard with real-time stats
- Complete booking management
- Calendar view with guide assignments
- Tours CRUD (multilingual PT/EN/ES)
- Guides, Customers, Financial management
- Aurora IA configuration
- RBAC authentication (5 roles)

**Tech Stack**: Next.js 14, Prisma ORM, JWT Auth, RBAC

#### 3️⃣ **Aurora IA**
Autonomous AI concierge that:
- Responds via WhatsApp & Facebook Messenger
- Provides tour information in 3 languages
- Creates complete bookings via chat
- Generates Stripe payment links
- Hands off complex queries to humans
- Self-evaluates and improves

**Tech Stack**: OpenAI GPT-4o-mini, WhatsApp Cloud API, Facebook Graph API

---

## 🎨 Brand Identity

### Official YYD Visual Identity
- **Primary**: Turquoise `#23C0E3`
- **Secondary**: WhatsApp Green `#25D366`
- **Accent**: Yellow `#FFD700`
- **Text**: Dark Gray `#333333`
- **Background**: White `#FFFFFF`

### Typography
- **Script Titles**: Pacifico (cursive)
- **Body Text**: Montserrat (sans-serif)
- **Numbers**: Poppins (sans-serif)

### Logo
Circular "Yes, you deserve!" script logo appears on **ALL pages** (Client + Backoffice)

---

## 🗄️ Database Schema

**Technology**: PostgreSQL via Prisma ORM

### Core Models
- `Product` - Tours with multilingual content (PT/EN/ES)
- `ProductSeasonPrice` - Seasonal pricing tiers
- `Booking` - Tour reservations
- `Customer` - CRM data
- `Guide` - Drivers with certifications
- `Payment` - Stripe payments
- `User` - Backoffice staff with RBAC roles
- `AuroraConversation` - AI chat logs

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete schema.

---

## 🔐 Authentication & Security

### RBAC System (5 Roles)
1. **Admin** - Full system access
2. **Director** - Business operations + reports
3. **Finance** - Financial data only
4. **Guide** - Own bookings + calendar
5. **Support** - Customer service

### Security Features
- JWT authentication with 7-day expiry
- HTTP-only cookies
- bcrypt password hashing (10 rounds)
- Protected API routes
- Middleware auth checks on ALL Backoffice routes

**Default Login**: `admin@yyd.tours` / `admin123`

See [AUTHENTICATION.md](./AUTHENTICATION.md) for details.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Stripe account
- OpenAI API key

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...
PGHOST=...
PGUSER=...
PGPASSWORD=...
PGDATABASE=...
PGPORT=5432

# Authentication
JWT_SECRET_KEY=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_...

# OpenAI
OPENAI_API_KEY=sk-...

# WhatsApp (optional)
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...

# Facebook (optional)
FACEBOOK_PAGE_ACCESS_TOKEN=...
FACEBOOK_PAGE_ID=...
```

### Installation
```bash
cd yyd
pnpm install
npm run prisma:gen
npm run db:push
npx tsx prisma/seed-admin.ts
pnpm dev
```

### Access
- **Client**: http://localhost:5000
- **Backoffice**: http://localhost:3001
- **Login**: admin@yyd.tours / admin123

---

## 📊 Implementation Status

**Total Features**: 63  
**Completed**: 12 ✅  
**In Progress**: 51 🔄  

See [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) for detailed breakdown.

---

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS (via custom globals.css)

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Neon)
- bcryptjs + JWT

### Payments
- Stripe (Checkout + Webhooks)

### AI/ML
- OpenAI GPT-4o-mini
- Custom prompt engineering

### Integrations
- WhatsApp Cloud API
- Facebook Graph API
- PDFKit (vouchers)
- QRCode generation

---

## 📝 Development Workflow

1. **Feature Development**
   - Create feature branch
   - Implement with tests
   - Document in `/docs`
   - Update IMPLEMENTATION-STATUS.md
   - Create PR with screenshots

2. **Code Standards**
   - TypeScript strict mode
   - Prisma for all DB operations
   - Server-side validation
   - Error handling on all APIs

3. **Documentation**
   - Update docs BEFORE merging
   - Include API examples
   - Add security notes
   - Update changelog

---

## 🔗 External Links

- **Live Site**: https://www.yesyoudeserve.tours
- **TripAdvisor**: [200+ 5-star reviews]
- **ABC Feature**: Good Morning America

---

## 📧 Contact

**Technical Support**: Fillipe Guerra  
**Business**: Daniel Ponce (daniel@yyd.tours)  
**Location**: Sintra & Cascais, Portugal  

---

**Last Updated**: 2025-10-20  
**Version**: 2.0.0 Production (In Development)  
**License**: Proprietary - Yes, You Deserve! Ltd.
