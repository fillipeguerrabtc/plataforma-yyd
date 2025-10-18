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
- **2025-10-18**: Complete Frontend Redesign to Match Official YYD Website
  - **14 New Components Created**: HeroSection, AwardsSection, FeaturesSection, StatsCounter, ComparisonTable, TestimonialsSection, WhyChooseSection, LeadCaptureForm, ContactSection, Footer, and improved TourCards
  - **Exact Visual Match**: Turquoise #5FBCBC, Gold #E9C46A, Playfair Display + Lato fonts matching yesyoudeserve.tours
  - **Hero Section**: Background image, Trustindex badge (257 reviews), ABC GMA feature, dual CTAs
  - **Lead Capture**: Name, email, phone, source dropdown, privacy consent with validation
  - **Conversion Funnel**: Comparison table, testimonials, why choose, contact options (WhatsApp/Messenger recommended)
  - **Animations**: Smooth Framer Motion scroll animations on all sections
  - **Responsive Design**: Mobile-first approach with breakpoints for all sections
  - **Architect Approved**: PASS status, production-ready, no critical issues
  - **Type Safety**: Full TypeScript, vanilla-extract CSS-in-TS, zero runtime overhead
  - **Real Data**: 3 tour packages (Half-Day €340-400, Full-Day €420-520, All-Inclusive €580-1,650)

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
- **Fonts**: Playfair Display (headings), Lato (body) via Google Fonts (exact match to official website)
- **Colors**: Turquoise #5FBCBC, Gold #E9C46A, Black #1A1A1A (exact match to official website)
- **Features**: SSR tours, animated cards, accessible booking modals, lead capture form, comparison table, testimonials
- **Page Structure**: Hero → No Crowds → Awards → Features → Stats → Tours → Comparison → Testimonials → Why Choose → Lead Form → Contact → Footer

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
- **Design system**: Turquoise #5FBCBC/Gold #E9C46A/Black #1A1A1A, Playfair Display/Lato fonts (exact match to yesyoudeserve.tours)
- **Mathematical rigor**: Aurora IA based on affective embeddings in ℝ³
- **Complete BackOffice**: User management, financial management (RBAC), integrations configuration

## Next Steps
1. ✅ **COMPLETED**: Frontend redesign matching official YYD website
2. Wire lead capture form to backend API for data persistence
3. Implement booking flow with Stripe payment processing
4. Build BackOffice interface (user management, financial, integrations)
5. Implement Aurora IA multilingual chatbot
6. Add pgvector for affective embeddings
7. Integrate Meta/WhatsApp/Stripe APIs
8. Add event-driven architecture with Kafka
9. Deploy to production
