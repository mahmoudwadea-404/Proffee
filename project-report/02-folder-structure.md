# 02 — Folder Structure

## Directory Tree (4 levels deep)

```
proffee-v2/
├── .env                          # Environment variables (secrets)
├── .gitignore
├── AGENTS.md                     # AI agent instructions for Next.js 16
├── eslint.config.mjs             # ESLint 9 flat config
├── next-env.d.ts                 # Next.js TypeScript declarations
├── next.config.ts                # Next.js configuration
├── package.json
├── package-lock.json
├── postcss.config.mjs            # PostCSS config (Tailwind v4)
├── proxy.ts                      # Route protection middleware
├── README.md
├── tsconfig.json
│
├── actions/                      # Server Actions (mutations)
│   ├── admin.ts                  # Admin CRUD (products, orders, stats)
│   ├── auth.ts                   # User DB sync, Prisma ID resolution
│   ├── cart.ts                   # Server-side cart CRUD
│   └── orders.ts                 # Order creation (COD + Card), payment redirect
│
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (fonts, CartProvider, Toaster)
│   ├── globals.css               # Tailwind v4 theme tokens
│   ├── favicon.ico
│   │
│   ├── (auth)/                   # Route group: authentication pages
│   │   ├── layout.tsx            # Centered card layout with Proffee branding
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   │
│   ├── (public)/                 # Route group: public storefront
│   │   ├── layout.tsx            # Navbar + Footer wrapper
│   │   ├── page.tsx              # Homepage
│   │   ├── about/
│   │   ├── cart/
│   │   ├── checkout/
│   │   │   ├── page.tsx          # Checkout form
│   │   │   ├── success/          # Order confirmation
│   │   │   └── payment-result/   # Paymob payment status
│   │   ├── contact/
│   │   ├── faqs/
│   │   ├── privacy/
│   │   ├── products/
│   │   │   ├── page.tsx          # Product listing
│   │   │   └── [slug]/           # Product detail (dynamic route)
│   │   ├── returns/
│   │   ├── shipping/
│   │   └── terms/
│   │
│   ├── account/                  # User account (standalone, no shared layout)
│   │   ├── page.tsx
│   │   └── reset-password/
│   │
│   ├── admin/                    # Admin dashboard
│   │   ├── layout.tsx            # Sidebar nav with auth guard
│   │   ├── page.tsx              # Dashboard stats
│   │   ├── products/             # Product CRUD
│   │   └── orders/               # Order management
│   │
│   ├── api/                      # API routes
│   │   ├── orders/[id]/payment-status/
│   │   ├── user/role/
│   │   └── webhooks/paymob/
│   │
│   └── auth/
│       └── callback/             # OAuth callback handler
│
├── components/                   # Reusable UI components
│   ├── checkout/
│   │   ├── LocationPicker.tsx    # Map picker modal
│   │   └── LocationPickerMap.tsx # Leaflet map component
│   ├── home/                     # Homepage sections
│   │   ├── Hero.tsx
│   │   ├── FeaturesRibbon.tsx
│   │   ├── PopularPicks.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Newsletter.tsx
│   │   ├── FAQ.tsx
│   │   └── AboutSection.tsx
│   └── layout/
│       ├── Navbar.tsx            # Global navigation bar
│       └── Footer.tsx            # Global footer
│
├── docs/
│   └── dev-notes/                # Development documentation
│
├── lib/                          # Shared libraries and utilities
│   ├── cart-context.tsx          # Cart React Context provider
│   ├── db-products.ts            # Product database queries
│   ├── paymob.ts                 # Paymob payment integration
│   ├── prisma.ts                 # Prisma client singleton
│   ├── products.ts               # Product type definitions
│   └── supabase/
│       ├── client.ts             # Browser Supabase client
│       └── middleware.ts         # Server-side session helper
│
├── Photos/                       # Local product photos (raw/source)
│
├── prisma/
│   ├── schema.prisma             # Database schema (8 models)
│   └── seed.ts                   # Database seed (8 products)
│
├── public/
│   └── images/
│       ├── products/             # Product images served statically
│       ├── proffee-hero-coffee.jpg
│       └── proffee-gold-about.jpeg
│
├── scripts/
│   ├── cleanup-stale-orders.ts   # Utility to clean orphaned orders
│   └── setup-storage.sql         # Supabase storage bucket setup
│
├── supabase/
│   └── migrations/
│       └── 20260617000001_enable_rls.sql
│
└── types/
    └── auth.ts                   # Zod schemas for login/register
```

## Folder Purposes

| Folder | Purpose |
|--------|---------|
| `app/` | Next.js App Router — all pages, layouts, API routes, and middleware |
| `components/` | Reusable React components (layout, homepage sections, checkout) |
| `lib/` | Shared business logic, context providers, database queries, external service integrations |
| `actions/` | Server Actions — the server-side mutation layer (replaces traditional REST controllers) |
| `types/` | Shared TypeScript type definitions and Zod validation schemas |
| `prisma/` | Database schema definition, migrations, and seed data |
| `public/` | Static assets served directly by Next.js (images, SVGs) |
| `docs/` | Development documentation and fix notes |
| `scripts/` | One-off utility scripts (cleanup, setup) |
| `supabase/` | Supabase migration files |
| `Photos/` | Local source photos for products (not served by the app) |

## Notable Absences

| Expected Folder | Status | Notes |
|----------------|--------|-------|
| `src/` | **Not used** | App Router is at project root |
| `hooks/` | **Not used** | No custom hooks directory; hooks are inline in components |
| `contexts/` | **Not used** | Context lives in `lib/cart-context.tsx` |
| `utils/` | **Not used** | Utility functions are minimal and inline |
| `services/` | **Not used** | Service logic is in `lib/` and `actions/` |
| `assets/` | **Not used** | Static assets are in `public/` |
| `styles/` | **Not used** | Single `globals.css` with Tailwind theme |
| `api/` (root) | **Not used** | API routes are in `app/api/` (App Router convention) |
| `.env.example` | **Missing** | No environment variable template exists |
| `components/ui/` | **Not used** | No shared UI component library; each component is standalone |
