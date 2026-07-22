# 01 — Project Overview

## Purpose

Proffee v2 is an **Egyptian specialty coffee e-commerce web application** that allows customers to browse, purchase, and review premium coffee products. The platform supports two payment methods (Cash on Delivery and Card payment via Paymob), a full admin dashboard for product and order management, and an authenticated user account system.

The brand targets the Egyptian market with bilingual product descriptions (English + Arabic), Egyptian Pound (EGP) pricing, and all 27 Egyptian governorates supported in the checkout flow.

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.2.9 |
| **Language** | TypeScript | ^5.x (strict mode) |
| **Runtime** | React | 19.2.4 |
| **Build Tool** | Next.js (Turbopack) | Bundled with Next 16 |
| **Package Manager** | npm | (lockfile v3) |
| **CSS Framework** | Tailwind CSS | v4 (CSS-based config) |
| **CSS Processing** | PostCSS + `@tailwindcss/postcss` | ^4 |
| **ORM** | Prisma | ^6.19.3 |
| **Database** | PostgreSQL (via Supabase) | — |
| **Authentication** | Supabase Auth (SSR) | @supabase/ssr ^0.12.0, @supabase/supabase-js ^2.108.2 |
| **Payment Gateway** | Paymob (Intention API) | Custom integration |
| **Validation** | Zod | ^4.4.3 |
| **Animation** | Framer Motion | ^12.40.0 |
| **Icons** | Lucide React | ^1.20.0 |
| **Maps** | Leaflet + React-Leaflet | leaflet ^1.9.4, react-leaflet ^5.0.0 |
| **Linting** | ESLint 9 (flat config) | eslint-config-next 16.2.9 |
| **Hosting** | Vercel (inferred from config) | — |

## Main Libraries

| Library | Purpose |
|---------|---------|
| `react-hook-form` | Installed but **unused** — form state management |
| `@hookform/resolvers` | Installed but **unused** — zod integration for react-hook-form |
| `sonner` | Installed — toast notifications (used in root layout `<Toaster />`) |
| `clsx` | Installed — conditional className utility |
| `tailwind-merge` | Installed — deduplication of Tailwind classes |
| `framer-motion` | Animations throughout the UI (scroll reveals, page transitions, carousels, accordions) |
| `leaflet` / `react-leaflet` | OpenStreetMap-based location picker in checkout |
| `lucide-react` | Icon library used across all components |

## Overall Architecture

```
┌─────────────────────────────────────────────────┐
│                   Client (Browser)               │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Pages    │  │Components│  │ Cart Context  │  │
│  │(App      │  │(Layout,  │  │ (localStorage │  │
│  │ Router)  │  │ Home,    │  │  + Supabase)  │  │
│  │          │  │ Checkout)│  │               │  │
│  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │              │                │           │
│       └──────────────┼────────────────┘           │
│                      │                            │
│              Server Actions / API Routes          │
└──────────────────────┬───────────────────────────┘
                       │
         ┌─────────────┼─────────────────┐
         │             │                 │
    ┌────▼────┐  ┌─────▼─────┐  ┌───────▼───────┐
    │ Prisma  │  │ Supabase  │  │    Paymob     │
    │ (ORM)   │  │ (Auth)    │  │  (Payments)   │
    └────┬────┘  └───────────┘  └───────────────┘
         │
    ┌────▼──────────┐
    │  PostgreSQL   │
    │  (Supabase)   │
    └───────────────┘
```

**Key architectural decisions:**

1. **App Router** with route groups: `(public)` for storefront, `(auth)` for login/register, standalone `admin/` and `account/` directories
2. **Server-first rendering** for public product pages (server components fetch data), with client components for interactive sections
3. **Server Actions** for all mutations (no custom REST API except webhooks and role lookup)
4. **Dual-mode cart**: localStorage for anonymous users, Prisma DB for authenticated users, with merge-on-login strategy
5. **Dual-ID auth system**: Supabase UUID for authentication, Prisma CUID for application data
6. **Paymob Intention API** (modern flow) with HMAC-verified webhooks and redirect callbacks
