# YYD Platform - Yes You Deserve

## Overview
Premium electric tuk-tuk tour platform for **YYD (Yes You Deserve)** - a boutique tour company in Sintra/Cascais, Portugal.

**Founded by**: Daniel Ponce  
**Featured on**: ABC Good Morning America  
**Reviews**: 200+ 5-star TripAdvisor reviews  

## Current State: CLEAN SLATE (2025-10-19)

The platform has been **completely reset** to a minimal, clean foundation:

### ✅ What's Working Now
- **Database**: PostgreSQL connected via Prisma ORM
- **Prisma Schema**: 7 tables configured (Product, Booking, Customer, Integration, AccountsPayable, AccountsReceivable, TicketAvailability)
- **Client App**: Next.js 14 running on port 5000 (clean homepage)
- **Backoffice App**: Next.js 14 running on port 3001 (clean homepage)
- **TypeScript Monorepo**: pnpm workspaces structure (apps/, packages/)
- **No complexity**: All proxy systems, telemetry, guard tools removed

### 🎨 Design System
- **Primary**: Turquoise #37C8C4
- **Secondary**: Gold #E9C46A
- **Accent**: Bordeaux #7E3231
- **Typography**: Montserrat 700 (headings), Lato 400 (body), Playfair Display (decorative)

### 🗄️ Database Schema (Prisma)
```
Product
  - id, slug (unique), title, description
  - priceEur, duration, imageUrls, externalUrl
  - active, createdAt, updatedAt

Booking
  - id, customerId, productId, date, seats
  - status, priceEur, createdAt, updatedAt

Customer
  - id, name, email (unique), phone, locale
  - createdAt, updatedAt

Integration
  - id, kind, name, config (JSON), active
  - createdAt, updatedAt

AccountsPayable
  - id, vendor, amount, dueDate, status
  - createdAt, updatedAt

AccountsReceivable
  - id, customerId, amount, dueDate, status
  - createdAt, updatedAt

TicketAvailability
  - id, productId, provider, date, status, raw (JSON)
  - createdAt, updatedAt
```

### 📂 File Structure
```
yyd/
├── apps/
│   ├── client/          # Public-facing website (port 5000)
│   └── backoffice/      # Admin dashboard (port 3001)
├── packages/
│   └── shared/          # Shared TypeScript types
├── prisma/
│   └── schema.prisma    # Database schema
└── package.json         # Monorepo root
```

### 🚀 Available Commands
```bash
cd yyd
pnpm install              # Install all dependencies
pnpm prisma:gen           # Generate Prisma Client
pnpm db:push              # Push schema to database
pnpm dev                  # Run all apps in dev mode
```

## Previous Work (Removed)
The following systems were built but removed to simplify:
- ❌ Proxy SDK (ChatGPT reasoning proxy) - removed, no token savings
- ❌ Telemetry system (metrics collection) - removed
- ❌ Guard tools (code scanning) - removed
- ❌ Aurora Service (webhooks, ticket checking) - removed
- ❌ FastAPI backend - removed
- ❌ Ingest scraper - removed

## Project Goals (Future)
Based on 26,120-line technical whitepaper:
- **Aurora IA**: Multilingual AI concierge with affective embeddings
- **Booking System**: Real-time availability, Stripe payments
- **BackOffice**: User management, financial management (RBAC)
- **CRM**: Customer relationship management
- **Integrations**: Meta/WhatsApp/Stripe configuration
- **Multilingual**: PT-BR (admin), EN (client), ES (fallback)

## Documentation Available
Technical specifications saved locally for reference:
- **docs/00-genesis-philosophy.md** - Business model, personas, visual identity, Aurora overview
- **docs/01-technical-foundation.md** - Database schema, APIs, integrations, security, design system
- **docs/yyd-whitepaper.txt** - Full 26,000+ line technical whitepaper (complete reference)

## User Preferences
- **No mock data**: Everything must be real
- **Simple first**: Build incrementally, avoid over-engineering
- **Direct communication**: User provides specific instructions
- **Token economy**: User brings specifications, agent executes
- **Documentation-driven**: Technical specs in docs/ folder, consult when needed

## Next Steps
Ready to build based on user direction. The foundation is clean and minimal with complete technical documentation available for reference.
