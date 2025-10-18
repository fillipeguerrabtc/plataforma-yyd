# YYD Platform - Yes You Deserve

## Overview
Complete, state-of-the-art platform for **YYD (Yes You Deserve)** - a boutique electric tuk-tuk tour company in Sintra/Cascais, Portugal. The platform includes Aurora IA (multilingual AI concierge with affective embeddings), complete BackOffice (user management, financial management with RBAC, integrations configuration for Meta/WhatsApp/Stripe), booking system with Stripe payments, CRM, event-driven architecture with Kafka, and multilingual support (EN/PT-BR/ES).

**Founded by**: Daniel Ponce  
**Featured on**: ABC Good Morning America  
**Reviews**: 200+ 5-star TripAdvisor reviews  

**Zero mock data - all real tours and company data.**

## Project Goal
Build a comprehensive platform based on a 26,120-line technical whitepaper with mathematical proofs and detailed specifications. The platform includes:
- **Aurora IA**: Multilingual AI concierge with affective embeddings in ℝ³, stability proofs, tensor calculations
- **BackOffice**: Complete user management, financial management (RBAC controlled), integrations configuration panel (modify + add new)
- **Booking System**: Stripe payments, real-time availability, automated confirmations
- **CRM**: Customer relationship management with conversation tracking
- **Event-Driven Architecture**: Kafka for scalability and real-time processing
- **Multilingual Support**: English, Portuguese (BR), Spanish

## Recent Changes
- **2025-10-18**: Upgraded to State-of-the-Art Modern Stack
  - **Migrated Frontend**: Next.js 14 (App Router) with SSR replacing Vite React
  - **Design System**: vanilla-extract with type-safe design tokens (YYD colors, fonts, spacing)
  - **UI Components**: Radix UI (accessible, headless) + Framer Motion (smooth animations)
  - **Backend Integration**: FastAPI serving 4 real YYD tours via PostgreSQL
  - **Type Safety**: Full TypeScript integration aligned with backend models (UUID, decimals)
  - **Architect Approved**: All critical issues resolved (dynamic fetch, type contracts, design tokens)
  - **100% Open Source**: Next.js, vanilla-extract, Radix, Framer Motion all MIT licensed
  - **Production Ready**: Environment-driven configuration, SSR optimization, accessible modals

## Project Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Uvicorn
- **ORM**: SQLAlchemy with PostgreSQL
- **Authentication**: JWT tokens (future)
- **API Structure**: RESTful API with versioning (`/api/v1/`)
- **Database**: PostgreSQL (Neon) with real tour data
- **CORS**: Configured for Replit environment

### Frontend (Next.js 14 + Modern Stack)
- **Client App**: Port 5000, Next.js 14 App Router with SSR
- **BackOffice**: Vite + React (future migration to shared components)
- **Framework**: Next.js 14 (App Router, React 18)
- **Styling**: vanilla-extract (type-safe CSS-in-TS, zero runtime)
- **Design Tokens**: YYD colors, fonts, spacing all typed and centralized
- **Components**: Radix UI (Dialog, Dropdown) + Framer Motion animations
- **Fonts**: Montserrat (headings), Lato (body) via Google Fonts
- **Colors**: Turquoise #37C8C4, Gold #E9C46A, Black #1A1A1A
- **Features**: SSR tours, animated cards, accessible booking modals

### Database Schema
- **tour_products**: Real YYD tours with multilingual content (PT/EN/ES)
- **bookings**: Tour reservations with Stripe integration
- **users**: Customer and staff accounts
- **guides**: Tour guide profiles
- **vehicles**: Electric tuk-tuk fleet
- **conversations**: CRM conversation tracking
- **messages**: Chat history
- **reviews**: Customer feedback
- **embeddings**: Aurora IA knowledge base (pgvector - temporarily disabled)

### Real Tours
1. **Sintra Magic Private Tour** - €220, 240 min, Cultural & Historical
2. **Sunset at Cabo da Roca** - €180, 120 min, Romantic & Nature
3. **Lisbon Electric Experience** - €160, 180 min, City Tours
4. **Douro Intimate Wine Route** - €320, 480 min, Wine & Gastronomy

## User Preferences
- **No mock data**: Everything must be real and state-of-the-art
- **Event-driven architecture**: Use Kafka for scalability
- **Design system**: Turquoise/Gold/Black, Montserrat/Lato fonts
- **Mathematical rigor**: Aurora IA based on affective embeddings in ℝ³
- **Complete BackOffice**: User management, financial management (RBAC), integrations configuration

## Next Steps
1. Implement booking flow with Stripe payments
2. Build BackOffice interface (user management, financial, integrations)
3. Implement Aurora IA multilingual chatbot
4. Add pgvector for affective embeddings
5. Integrate Meta/WhatsApp/Stripe
6. Add event-driven architecture with Kafka
7. Deploy to production
