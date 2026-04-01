# System Architecture & Data Models

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
3. [Data Models](#data-models)
4. [Component Architecture](#component-architecture)
5. [Technology Stack](#technology-stack)
6. [Security & Access Control](#security--access-control)

---

## High-Level Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (PWA)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   B2C Web    │  │   B2B Web    │  │   Mobile     │      │
│  │   (React)    │  │   (React)    │  │   (PWA)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST + WebSocket
                            │
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway & Auth Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   Rate       │  │   Request    │      │
│  │   Service    │  │   Limiting   │  │   Routing    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Microservices Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   User       │  │   Property   │  │   Financial  │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Lead       │  │   AI/ML      │  │   Marketplace│      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Messaging  │  │   Community  │                        │
│  │   Service    │  │   Service    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Data & Integration Layer                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │   Redis      │  │   S3/Blob    │      │
│  │  (Primary)   │  │   (Cache)    │  │   Storage    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   MLS API    │  │   Plaid      │  │   Insurance  │      │
│  │   Gateway    │  │   Gateway    │  │   APIs       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Entity Relationship Diagram (ERD)

### Core Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                            USER MANAGEMENT                           │
├─────────────────────┬─────────────────────┬─────────────────────┐   │
│      User           │   UserProfile       │   UserPreferences   │   │
├─────────────────────┼─────────────────────┼─────────────────────┤   │
│ id (PK)             │ id (PK)             │ id (PK)             │   │
│ email               │ user_id (FK)        │ user_id (FK)        │   │
│ password_hash       │ first_name          │ notification_email  │   │
│ role                │ last_name           │ notification_sms    │   │
│ email_verified      │ phone               │ marketing_opt_in    │   │
│ created_at          │ date_of_birth       │ preferred_language  │   │
│ updated_at          │ profile_image_url   │                     │   │
│ last_login_at       │ bio                 │                     │   │
└─────────────────────┴─────────────────────┴─────────────────────┘   │
                            │                                           │
                            │ 1:1                                        │
                            │                                           │
┌─────────────────────────────────────────────────────────────────────┐
│                        FINANCIAL & READINESS                        │
├─────────────────────┬─────────────────────┬─────────────────────┐   │
│ FinancialAccount    │ FinancialHealth     │ ReadinessScore      │   │
├─────────────────────┼─────────────────────┼─────────────────────┤   │
│ id (PK)             │ id (PK)             │ id (PK)             │   │
│ user_id (FK)        │ user_id (FK)        │ user_id (FK)        │   │
│ plaid_account_id    │ credit_score        │ overall_score       │   │
│ account_type        │ debt_to_income      │ credit_score        │   │
│ institution_name    │ monthly_income      │ savings_score       │   │
│ account_number_mask │ monthly_expenses    │ income_score        │   │
│ balance             │ emergency_fund      │ debt_score          │   │
│ last_synced_at      │ calculated_at       │ calculated_at       │   │
└─────────────────────┴─────────────────────┴─────────────────────┘   │

┌─────────────────────────────────────────────────────────────────────┐
│                    ACTION PLAN & MILESTONES                         │
├─────────────────────┬─────────────────────┬─────────────────────┐   │
│ ActionPlan          │ Milestone           │ MilestoneTask       │   │
├─────────────────────┼─────────────────────┼─────────────────────┤   │
│ id (PK)             │ id (PK)             │ id (PK)             │   │
│ user_id (FK)        │ action_plan_id (FK) │ milestone_id (FK)   │   │
│ status              │ title               │ title               │   │
│ started_at          │ description         │ description         │   │
│ completed_at        │ order_sequence      │ order_sequence      │   │
│                     │ status              │ status              │   │
│                     │ due_date            │ completed_at        │   │
│                     │ completed_at        │                     │   │
└─────────────────────┴─────────────────────┴─────────────────────┘   │

┌─────────────────────────────────────────────────────────────────────┐
│              SERVICE PROVIDER & CLOSING COST MARKETPLACE            │
├─────────────────────┬─────────────────────┬─────────────────────┐   │
│ ServiceProvider     │ ServiceCategory     │ LocalPricingQuote   │   │
├─────────────────────┼─────────────────────┼─────────────────────┤   │
│ id (PK)             │ id (PK)             │ id (PK)             │   │
│ professional_id(FK) │ name                │ service_provider_id │   │
│ company_name        │ description         │ service_category_id │   │
│ service_types[]     │ icon                │ zip_code            │   │
│ license_numbers[]   │ display_order       │ base_price          │   │
│ verified_at         │                     │ price_range_min     │   │
│ featured            │                     │ price_range_max     │   │
│ commission_rate     │                     │ unit_type           │   │
│                     │                     │ (flat/percentage)   │   │
│                     │                     │ effective_date      │   │
│                     │                     │ expires_at          │   │
└─────────────────────┴─────────────────────┴─────────────────────┘   │
                            │                                           │
                            │ 1:N                                        │
                            │                                           │
┌─────────────────────┬─────────────────────┬─────────────────────┐   │
│ ServiceRequest      │ ServiceBooking      │ ServiceReview       │   │
├─────────────────────┼─────────────────────┼─────────────────────┤   │
│ id (PK)             │ id (PK)             │ id (PK)             │   │
│ user_id (FK)        │ service_request_id  │ booking_id (FK)     │   │
│ property_address    │ service_provider_id │ user_id (FK)        │   │
│ property_price      │ quote_id (FK)       │ rating (1-5)        │   │
│ zip_code            │ scheduled_at        │ review_text         │   │
│ requested_services[]│ status              │ created_at          │   │
│ created_at          │ price_final         │                     │   │
└─────────────────────┴─────────────────────┴─────────────────────┘   │
```

---

## Data Models

### User & Profile

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'homebuyer',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    profile_image_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);
```

### Service Provider Marketplace

```sql
CREATE TABLE service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    service_types TEXT[] NOT NULL,
    license_numbers TEXT[],
    verified_at TIMESTAMP,
    featured BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE local_pricing_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
    service_category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
    zip_code VARCHAR(10) NOT NULL,
    base_price DECIMAL(10, 2),
    price_range_min DECIMAL(10, 2),
    price_range_max DECIMAL(10, 2),
    unit_type VARCHAR(50) DEFAULT 'flat',
    effective_date DATE NOT NULL,
    expires_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

*(Complete SQL schemas for all entities are available in the full documentation)*

---

## Component Architecture

### Frontend (Next.js/React)

```
src/
├── app/
│   ├── (b2c)/
│   │   ├── dashboard/
│   │   ├── action-plan/
│   │   ├── properties/
│   │   ├── lenders/
│   │   ├── agents/
│   │   ├── closing-costs/
│   │   └── community/
│   ├── (b2b)/
│   │   ├── pro/dashboard/
│   │   ├── pro/leads/
│   │   └── service-provider/
│   └── api/
├── components/
│   ├── shared/
│   ├── b2c/
│   └── b2b/
├── lib/
│   ├── api/
│   ├── ai/
│   └── hooks/
└── stores/
```

### Backend (Node.js/Express)

```
backend/
├── src/
│   ├── services/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── routes/
│   ├── integrations/
│   └── workers/
├── tests/
└── config/
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (React 18+)
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query
- **PWA**: next-pwa

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL 15+
- **Cache**: Redis
- **Queue**: BullMQ

### AI & ML
- **LLM Provider**: OpenAI GPT-4
- **Vector DB**: pgvector (PostgreSQL extension)

---

## Security & Access Control

### Role-Based Access Control (RBAC)

```typescript
enum UserRole {
  HOMEBUYER = 'homebuyer',
  AGENT = 'agent',
  LENDER = 'lender',
  INSPECTOR = 'inspector',
  TITLE_COMPANY = 'title_company',
  ADMIN = 'admin'
}
```

### Data Access Rules
1. Users can only access their own data unless explicitly shared
2. Professionals can only see leads assigned to them
3. Financial data encrypted at rest, requires explicit consent
4. PII anonymization for community forums

---

*For complete database schemas, API specifications, and detailed component breakdowns, see the implementation repository.*

