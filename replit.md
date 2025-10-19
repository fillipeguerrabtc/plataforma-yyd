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
- **2025-10-19**: MONOREPO TYPESCRIPT CRIADO (yyd/)
  - **Estrutura**: pnpm workspaces (apps/, packages/, tools/)
  - **@yyd/proxy-sdk**: SDK para raciocínio via ChatGPT (economiza tokens Replit)
  - **@yyd/shared**: Tipos TypeScript compartilhados (QuoteRequest, BookingRequest, etc.)
  - **apps/ingest**: Scraper REAL de yesyoudeserve.tours → Prisma
  - **tools/guard**: Sistema anti-OpenAI (força uso do proxy-sdk)
  - **Prisma Schema**: Product, Booking, Customer, Integration, AccountsPayable/Receivable, TicketAvailability
  - **Build Sistema**: TypeScript compilado, tudo buildado com sucesso
  - **Documentação**: README.md completo com arquitetura e guias
  
- **2025-10-18**: COMPLETE BACKOFFICE SYSTEM BUILT
  - **Frontend BackOffice**: Full administrative dashboard at `/backoffice`
  - **6 Management Panels Created**: Dashboard, Site Config, Tours, Bookings, Leads, Users
  - **Authentication**: JWT-based login with role-based access control (admin/manager/guide/staff)
  - **Site Configuration Panel**: Edit ALL website content from official yesyoudeserve.tours (texts, images, videos)
  - **Tours Management**: CRUD for all tour packages with pricing and visibility controls
  - **Bookings Management**: View and manage all customer bookings with status filters
  - **Leads Management**: Track all lead submissions from contact form with export capability
  - **Users Management**: RBAC with 4 roles, user creation, and permission management
  - **Dashboard**: Live metrics (bookings, revenue, leads), recent activity, KPIs
  - **Backend APIs**: Complete CRUD endpoints for config, media, users, all tested
  - **Database**: site_config, media_assets, users tables with real YYD data seeded
  - **Access**: Login at `/backoffice/auth/login` - Email: `admin@yesyoudeserve.tours` / Password: `password`

- **2025-10-18**: Official YYD Tours Created
  - **Personalized Half-Day Tour** - €280, 4 hours
  - **Personalized Full-Day Tour** - €420, 8 hours (BEST CHOICE)
  - **All-Inclusive Experience** - €640, 8 hours (transfer + lunch + tickets + wine included)
  
- **2025-10-18**: Frontend Client Site
  - **14 Components**: HeroSection, AwardsSection, FeaturesSection, StatsCounter, ComparisonTable, TestimonialsSection, WhyChooseSection, LeadCaptureForm, ContactSection, Footer
  - **Visual Identity**: Exact match to yesyoudeserve.tours (Turquoise #5FBCBC, Gold #E9C46A, Playfair Display + Lato fonts)
  - **Lead Capture Working**: Form posts to `/api/v1/leads/` with validation
  - **Booking + Stripe**: Full payment flow with Stripe Elements integration

## Project Architecture

### NEW: TypeScript Monorepo (yyd/)
- **Package Manager**: pnpm with workspaces
- **Build System**: TypeScript 5.6+ com builds paralelos
- **Database ORM**: Prisma Client (PostgreSQL)
- **Proxy SDK**: @yyd/proxy-sdk - ChatGPT reasoning para economizar tokens
- **Shared Types**: @yyd/shared - tipos compartilhados entre apps
- **Ingestão**: apps/ingest - scraper REAL de yesyoudeserve.tours
- **Guard System**: tools/guard - proíbe uso direto de 'openai' (exceto proxy-sdk)
- **Scripts**: `pnpm build`, `pnpm lint`, `pnpm prisma:gen`, `pnpm migrate`

### Backend (FastAPI)
- **Framework**: FastAPI with Uvicorn
- **ORM**: SQLAlchemy with PostgreSQL
- **Authentication**: JWT tokens (future)
- **API Structure**: RESTful API with versioning (`/api/v1/`)
- **Database**: PostgreSQL (Neon) with real tour data
- **CORS**: Configured for Replit environment

### Frontend (Next.js 14 + Modern Stack)
- **Client App**: Port 5000, Next.js 14 App Router at `/`
- **BackOffice App**: Next.js 14 App Router at `/backoffice` (COMPLETE ADMIN PANEL)
- **Framework**: Next.js 14 (App Router, React 18)
- **Styling**: Inline styles for BackOffice, vanilla-extract for client
- **Authentication**: JWT with localStorage, protected routes, role-based access
- **Design Tokens**: YYD colors, fonts, spacing all typed and centralized
- **Components**: Radix UI (Dialog, Dropdown) + Framer Motion animations
- **Fonts**: Playfair Display (headings), Lato (body) via Google Fonts
- **Colors**: Turquoise #5FBCBC, Gold #E9C46A, Black #1A1A1A
- **Features**: SSR tours, booking flow, lead capture, site configuration, admin dashboard
- **Client Structure**: Hero → No Crowds → Awards → Features → Stats → Tours → Comparison → Testimonials → Why Choose → Lead Form → Contact → Footer
- **BackOffice Structure**: Login → Dashboard → Config → Tours → Bookings → Leads → Users

### Database Schema (Prisma)
- **Product**: Catálogo tours (slug único, multilíngue, preços EUR, imagens, ativo)
- **Booking**: Reservas (customerId, productId, date, seats, status, priceEur)
- **Customer**: Clientes (name, email único, phone, locale)
- **Integration**: Integrações (kind, name, config JSON, active)
- **AccountsPayable**: Contas a pagar (vendor, amount, dueDate, status)
- **AccountsReceivable**: Contas a receber (customerId, amount, dueDate, status)
- **TicketAvailability**: Cache disponibilidade (productId, provider, date, status, raw JSON)

### Legacy Database Schema (FastAPI/SQLAlchemy)
- **tour_products**: Real YYD tours with multilingual content (PT/EN/ES)
- **bookings**: Tour reservations with Stripe integration
- **leads**: Contact form submissions (name, email, phone, source)
- **users**: BackOffice users with RBAC (admin/manager/guide/staff)
- **site_config**: All website content (hero, features, tours, contact, etc.) - editable from BackOffice
- **media_assets**: Images and videos (URLs, alt text, metadata) - manageable from BackOffice
- **guides**: Tour guide profiles (future)
- **vehicles**: Electric tuk-tuk fleet (future)
- **conversations**: CRM conversation tracking (future)
- **messages**: Chat history (future)
- **reviews**: Customer feedback (future)
- **embeddings**: Aurora IA knowledge base (pgvector - future)

### Official YYD Tours (from yesyoudeserve.tours)
1. **Personalized Half-Day Tour** - €280, 4 hours
   - Visit all monuments outside
   - Cabo da Roca
   - Personalized itinerary
   - Optional wine tasting (€24/person)
   
2. **Personalized Full-Day Tour** - €420, 8 hours (BEST CHOICE ⭐)
   - Everything in Half-Day
   - Azenhas do Mar
   - Cascais
   - Optional lunch and monument tickets
   - Wine tour available
   
3. **All-Inclusive Experience** - €640, 8 hours
   - Everything included: transfer service, authentic Portuguese lunch, monument tickets, wine tasting
   - No hidden costs
   - Ultimate luxury experience

### Legacy Tours (database)
- **Sintra Magic Private Tour** - €220, 240 min
- **Sunset at Cabo da Roca** - €180, 120 min
- **Lisbon Electric Experience** - €160, 180 min
- **Douro Intimate Wine Route** - €320, 480 min

## User Preferences
- **No mock data**: Everything must be real and state-of-the-art
- **Event-driven architecture**: Use Kafka for scalability
- **Design system**: Turquoise #5FBCBC/Gold #E9C46A/Black #1A1A1A, Playfair Display/Lato fonts (exact match to yesyoudeserve.tours)
- **Mathematical rigor**: Aurora IA based on affective embeddings in ℝ³
- **Complete BackOffice**: User management, financial management (RBAC), integrations configuration

## BackOffice Access
- **URL**: `/backoffice/auth/login`
- **Admin Email**: `admin@yesyoudeserve.tours`
- **Password**: `password`
- **Features**: Dashboard, Site Config, Tours, Bookings, Leads, Users management

## API Endpoints
### Public Client APIs
- `GET /api/v1/tours` - List all tours
- `POST /api/v1/bookings` - Create booking
- `POST /api/v1/bookings/{id}/payment-intent` - Create Stripe payment
- `POST /api/v1/leads` - Submit lead form

### BackOffice APIs (requires JWT)
- `POST /api/v1/backoffice/auth/login` - Login
- `GET /api/v1/backoffice/auth/me` - Get current user
- `GET /api/v1/backoffice/config` - List all site configs
- `PUT /api/v1/backoffice/config/{key}` - Update site config
- `GET /api/v1/backoffice/media` - List all media assets
- `POST /api/v1/backoffice/media` - Create media asset

## Cérebro Proxy Strategy
- **Objetivo**: Economizar tokens Replit usando ChatGPT subscription para raciocínio
- **Arquitetura**: Node.js proxy (port 3000) → OpenAI GPT-4
- **SDK**: @yyd/proxy-sdk exporta `reason(task, minimalContext)` com retry
- **Guard**: tools/guard/scan.js proíbe uso direto de 'openai' no código
- **Workflow**: ChatGPT planeja → Fillipe copia → Replit Agent executa operacionalmente

## Next Steps
1. ✅ **COMPLETED**: Frontend client matching official YYD website
2. ✅ **COMPLETED**: Lead capture form integrated with backend
3. ✅ **COMPLETED**: Booking flow with Stripe payment processing
4. ✅ **COMPLETED**: BackOffice complete (Dashboard, Config, Tours, Bookings, Leads, Users)
5. ✅ **COMPLETED**: Monorepo TypeScript com proxy-sdk, shared, ingest, guard
6. 🚧 **IN PROGRESS**: Database migrations Prisma (Product, Booking, Customer, etc.)
7. Rodar apps/ingest para popular catálogo REAL no Prisma
8. Reimplementar Aurora Core com tensor curvatura INTEGRADO (tasks 1-5 pendentes architect)
9. Aurora Mind com pgvector ivfflat index + batch embeddings
10. Pricing dinâmico EVD + Emotional Timing
11. BackOffice integrations panel (Meta/WhatsApp/Stripe config)
12. Event-driven architecture com Kafka
13. Deploy to production
