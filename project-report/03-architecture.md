# 03 — Architecture

## Routing

Next.js 16 App Router with three route groups:

```
app/
├── layout.tsx                    ← Root layout (fonts, CartProvider, Toaster)
│
├── (auth)/                       ← Route group: authentication
│   ├── layout.tsx                ← Centered card layout
│   ├── /login
│   ├── /register
│   └── /forgot-password
│
├── (public)/                     ← Route group: storefront
│   ├── layout.tsx                ← Navbar + Footer
│   ├── / (homepage)
│   ├── /about
│   ├── /products
│   ├── /products/[slug]
│   ├── /cart
│   ├── /checkout
│   ├── /checkout/success
│   ├── /checkout/payment-result
│   ├── /contact
│   ├── /faqs
│   ├── /shipping
│   ├── /terms
│   ├── /privacy
│   └── /returns
│
├── account/                      ← Standalone (no shared layout)
│   ├── /account
│   └── /account/reset-password
│
├── admin/                        ← Admin panel
│   ├── layout.tsx                ← Sidebar nav + auth guard
│   ├── /admin (dashboard)
│   ├── /admin/products
│   └── /admin/orders
│
├── api/                          ← API routes (App Router)
│   ├── /api/user/role
│   ├── /api/orders/[id]/payment-status
│   └── /api/webhooks/paymob
│
└── auth/
    └── /auth/callback            ← OAuth callback handler
```

## Rendering Strategy

| Page | Rendering | Notes |
|------|-----------|-------|
| `/` (homepage) | Server Component (async) | Fetches `getFeaturedProducts()` |
| `/products` | Server Component (async) | Fetches `getProducts()` + `getRoastLevels()` |
| `/products/[slug]` | Server Component (async) | Dynamic metadata via `generateMetadata()` |
| `/about`, `/contact`, `/faqs`, etc. | Server wrapper → Client component | Thin `page.tsx` renders `page.client.tsx` |
| `/checkout` | Server wrapper → Client component | All form state managed client-side |
| `/admin/*` | Client Component (`"use client"`) | Auth check + data fetch in `useEffect` |
| `/account` | Client Component (`"use client"`) | Auth check in `useEffect` |

**Pattern:** Every public page uses a thin `page.tsx` (metadata + renders client component) delegating to `page.client.tsx` for interactive UI.

## Data Flow

```
┌─────────────────────────────────────────────────┐
│                 SERVER SIDE                       │
│                                                   │
│  ┌──────────────┐   ┌─────────────────────────┐  │
│  │ Server       │   │ Server Actions           │  │
│  │ Components   │   │ (actions/*.ts)           │  │
│  │ (data fetch) │   │                         │  │
│  │              │   │ createOrder()           │  │
│  │ getProducts()│   │ createCardOrder()       │  │
│  │ getFeatured()│   │ createProduct()         │  │
│  └──────┬───────┘   └───────────┬─────────────┘  │
│         │                       │                 │
│         └───────────┬───────────┘                 │
│                     │                             │
│              ┌──────▼──────┐                      │
│              │   Prisma    │                      │
│              │   Client    │                      │
│              └──────┬──────┘                      │
│                     │                             │
└─────────────────────┼───────────────────────────┘
                      │
               ┌──────▼──────┐
               │  PostgreSQL │
               │  (Supabase) │
               └─────────────┘

┌─────────────────────────────────────────────────┐
│                 CLIENT SIDE                       │
│                                                   │
│  ┌──────────────────┐  ┌───────────────────────┐ │
│  │ Page Components  │  │ Cart Context          │ │
│  │ (useState for    │  │ (localStorage +       │ │
│  │  local state)    │  │  server sync)         │ │
│  └────────┬─────────┘  └───────────┬───────────┘ │
│           │                        │              │
│           └────────┬───────────────┘              │
│                    │                              │
│           ┌────────▼────────┐                     │
│           │ Server Actions  │ ← Invoked directly  │
│           │ via fetch()     │   from client       │
│           └─────────────────┘                     │
└─────────────────────────────────────────────────┘
```

## State Management

| Scope | Mechanism | Storage |
|-------|-----------|---------|
| **Cart** | React Context (`CartProvider`) | `localStorage` (anonymous) + Prisma DB (authenticated) |
| **Form state** | Component-level `useState` | In-memory |
| **Auth state** | Supabase client session | Browser cookies (managed by `@supabase/ssr`) |
| **UI state** | Component-level `useState` | In-memory (modals, loading, errors) |

**No global state library** (Redux, Zustand, Jotai) is used. The cart is the only cross-component shared state.

## API Layer

The project uses **two API patterns**:

1. **Server Actions** (primary) — All mutations go through `"use server"` functions in `actions/`:
   - `actions/auth.ts` — User DB sync
   - `actions/cart.ts` — Cart CRUD
   - `actions/orders.ts` — Order creation + payment
   - `actions/admin.ts` — Admin CRUD

2. **API Routes** (minimal) — Only used where server actions are insufficient:
   - `GET /api/user/role` — Role lookup (called by Navbar and admin layout)
   - `GET /api/orders/[id]/payment-status` — Payment polling endpoint
   - `POST /api/webhooks/paymob` — External webhook receiver

## Authentication

```
Registration Flow:
  Browser → Supabase Auth (email/password) → OAuth Callback (/auth/callback)
    → Prisma user.create() → Session cookies set

Login Flow:
  Browser → Supabase Auth (email/password) → Session cookies set
    → Navbar detects user → fetches /api/user/role

Route Protection:
  proxy.ts (middleware):
    /account/* → redirect to /login if no session
    /admin/*   → redirect to /login if no session
    Admin role check → done at component level (admin/layout.tsx)
```

## Storage

| Type | Provider | Usage |
|------|----------|-------|
| **Database** | PostgreSQL (Supabase) | Users, Products, Orders, CartItems, Reviews, Wishlists |
| **Auth** | Supabase Auth | User authentication, session management |
| **Images** | Local `/public/images/` | Product images, hero images |
| **File uploads** | Supabase Storage (planned) | Admin product image upload (`scripts/setup-storage.sql`) |
| **Client cache** | `localStorage` | Cart items (anonymous), Buy Now item (`sessionStorage`) |

## Environment Configuration

| Variable | Scope | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | Server | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Both | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Both | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase admin operations |
| `PAYMOB_SECRET_KEY` | Server | Paymob API authentication |
| `PAYMOB_INTEGRATION_ID` | Server | Paymob integration identifier |
| `PAYMOB_HMAC_SECRET` | Server | Webhook/redirect HMAC verification |
| `PAYMOB_PUBLIC_KEY` | Server | Paymob checkout URL construction |
| `NEXT_PUBLIC_BASE_URL` | Both | Base URL for Paymob callbacks (defaults to localhost) |
