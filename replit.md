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