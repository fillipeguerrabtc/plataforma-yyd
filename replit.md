# YYD Platform - Yes You Deserve

## Overview
YYD Platform is a premium electric tuk-tuk tour booking system for "Yes You Deserve," a boutique tour company operating in Sintra/Cascais, Portugal. The platform aims to provide a comprehensive, production-ready solution for managing tours, bookings, customer interactions, and backoffice operations, leveraging advanced AI for customer engagement. The project is nearing completion, with most core features implemented and operational.

## User Preferences
- **No mock data**: Everything must be real
- **Simple first**: Build incrementally, avoid over-engineering
- **Direct communication**: User provides specific instructions
- **Token economy**: User brings specifications, agent executes
- **Documentation-driven**: Technical specs in docs/ folder, consult when needed

## System Architecture
The platform is built as a monorepo containing client and backoffice applications.

### UI/UX Decisions
- **Design System**: Extracted from yesyoudeserve.tours, featuring a primary turquoise (#1FB7C4) color with gradients, dark gray text, and white/light gray backgrounds.
- **Typography**: 'Great Vibes' for display titles, 'Poppins' for body text, and 'Montserrat' for headings.
- **Components**: Rounded pill-shaped buttons with gradients and shadows, and rounded cards with turquoise borders on hover.
- **Aesthetic**: Professional, clean, with turquoise accents.

### Technical Implementations
- **Database**: PostgreSQL with Prisma ORM, featuring 16 models including User, Product, Booking, Payment, Customer, and specific operational models. Supports seasonal pricing and multilingual content.
- **Client App (Next.js 14)**: Handles the public-facing website, tour catalog, dual booking flow (UI or AI chat), and customer dashboard with passwordless authentication.
- **Backoffice App (Next.js 14)**: Provides a comprehensive admin dashboard with APIs for managing tours, guides, bookings, payments, reviews, and detailed financial and analytics features.
- **Authentication**: Passwordless JWT customer authentication (email-only) and RBAC for backoffice users.
- **Email System**: Nodemailer and Bull workers manage multilingual email templates (PT/EN/ES) and PDF voucher generation.
- **SEO**: Production-ready with dynamic sitemaps, robots.ts, and comprehensive metadata (OpenGraph, Twitter Cards).
- **Aurora IA (Intelligence Layer)**: A FastAPI service integrating Affective Mathematics ℝ³ for emotion analysis, GPT-4o-mini for conversational AI, and pgvector for semantic search on a knowledge base. Supports human handoff detection and dynamic tone selection. Integrated with WhatsApp and Facebook Messenger webhooks.
- **Financial System**: Comprehensive APIs and UI for Accounts Payable, Accounts Receivable, and reconciliation with cash flow analysis.
- **Monument Tickets API**: Manages availability and booking through external providers with caching.
- **BI Analytics**: Utilizes Recharts for visualizing revenue trends, product performance, and revenue distribution.
- **Security**: Separation of customer and backoffice authentication, ownership checks, and RBAC implementation. Performance optimizations include batch fetches and N+1 elimination.

### File Structure
The project uses a monorepo structure:
- `apps/client/`: Public-facing Next.js application.
- `apps/backoffice/`: Admin dashboard Next.js application.
- `packages/shared/`: Shared TypeScript types.
- `prisma/`: Database schema definitions.

## External Dependencies
- **PostgreSQL**: Primary database.
- **Prisma ORM**: Database toolkit for Node.js and TypeScript.
- **Next.js 14**: Frontend framework for client and backoffice applications.
- **Nodemailer**: Email sending library.
- **Bull**: Job queue for Node.js.
- **Stripe**: Payment processing gateway with webhook integration.
- **FastAPI**: Python web framework for Aurora AI service.
- **OpenAI**: Provides GPT-4o-mini for conversational AI and embeddings for semantic search.
- **pgvector**: PostgreSQL extension for vector similarity search.
- **Twilio**: For WhatsApp integration.
- **Recharts**: React charting library for BI Analytics.
- **PDFKit**: PDF document generation.
- **langdetect**: Language detection library.