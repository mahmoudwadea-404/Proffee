# Proffee v2 — Project Status Report

**Date:** 2026-07-02
**Version:** 0.1.0
**Audit Type:** Full codebase analysis (static)
**Status:** Mid-Development — Core e-commerce flow exists but is incomplete

---

## 1. Project Overview

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.9 |
| Language | TypeScript | ^5 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS v4 | ^4 |
| Database ORM | Prisma | 6.19.3 |
| Database | PostgreSQL (via Supabase) | — |
| Auth | Supabase (SSR) | @supabase/ssr ^0.12.0, @supabase/supabase-js ^2.108.2 |
| Forms | react-hook-form + zod | ^7.79.0 / ^4.4.3 |
| Animation | framer-motion | ^12.40.0 |
| Icons | lucide-react | ^1.20.0 |
| Toast | sonner | ^2.0.7 |
| CSS Utils | clsx + tailwind-merge | ^2.1.1 / ^3.6.0 |
| Dev – Lint | eslint-config-next | 16.2.9 |
| Dev – TS | tsx | ^4.22.4 |

### Project Structure

```
proffee-v2/
├── actions/           # Server Actions (auth, cart, orders, admin)
│   ├── auth.ts
│   ├── cart.ts
│   ├── orders.ts
│   └── admin.ts
├── app/               # Next.js App Router pages & API
│   ├── (auth)/        #   Login, Register, Forgot Password
│   ├── (public)/      #   Home, Products, About, Contact, Cart, Checkout
│   ├── account/       #   User account + Reset Password
│   ├── admin/         #   Admin dashboard, Products CRUD, Orders
│   ├── api/           #   api/user/role
│   ├── auth/          #   auth/callback (OAuth)
│   ├── layout.tsx     #   Root layout (fonts, CartProvider, Toaster)
│   └── globals.css    #   Tailwind v4 theme (coffee palette)
├── components/
│   ├── home/          #   Hero, AboutSection, PopularPicks, FeaturesRibbon, Testimonials, FAQ, Newsletter, FeaturedProducts
│   ├── layout/        #   Navbar, Footer
│   └── pixel-perfect-hero.tsx  (unused)
├── lib/
│   ├── supabase/      #   client.ts, server.ts
│   ├── cart-context.tsx
│   ├── prisma.ts      #   Singleton Prisma client
│   ├── db-products.ts #   Prisma-based product queries
│   ├── products.ts    #   Static product data (8 items)
│   └── utils.ts       #   cn() utility
├── prisma/
│   ├── schema.prisma  #   7 models + 2 enums
│   └── seed.ts        #   8 products seed
├── supabase/
│   └── migrations/    #   1 migration: RLS policies
├── types/
│   └── auth.ts        #   Zod schemas for login/register
├── proxy.ts           #   Supabase auth middleware (edge)
├── .env               #   DB + Supabase keys (COMMITTED - risk)
└── public/            #   Static assets (only Next.js defaults)
```

---

## 2. Database & Schema

### Prisma Models

| Model | Fields | Key Relations |
|-------|--------|---------------|
| **User** | id, supabaseId (unique), name, email (unique), role (enum: CUSTOMER/ADMIN), phone?, timestamps | HasMany: Order, Review, Wishlist, CartItem, Address |
| **Product** | id, name, slug (unique), description, price (Float), stock (Int), roastLevel, flavorNotes (String[]), weightOptions (Json), imageUrl, images (String[]), featured, timestamps | HasMany: OrderItem, Review, Wishlist, CartItem |
| **CartItem** | id, userId, productId, quantity (Int), weight?, createdAt | BelongsTo: User, Product |
| **Address** | id, userId, label, street, city, isDefault | BelongsTo: User |
| **Order** | id, userId, status (enum: PENDING/CONFIRMED/PROCESSING/SHIPPED/DELIVERED/CANCELLED), paymentStatus (default UNPAID), paymentMethod?, total (Float), shippingAddress (Json), phone, notes?, timestamps | BelongsTo: User; HasMany: OrderItem |
| **OrderItem** | id, orderId, productId, quantity, price, weight? | BelongsTo: Order, Product |
| **Review** | id, userId, productId, rating (Int), comment, createdAt | BelongsTo: User, Product |
| **Wishlist** | id, userId, productId, createdAt | BelongsTo: User, Product |

### Schema Observations

| Issue | Detail |
|-------|--------|
| `weightOptions` is `Json` type | Flexible but no type safety at DB level; relies on app-level validation |
| `paymentStatus` / `paymentMethod` are plain `String` | Should be an enum given payment lifecycle requirements |
| `Address` has no `state`, `zipCode`, `country` | May be insufficient for shipping outside Egypt or for international orders |
| `Review.rating` is `Int` not `Float` | Can only store whole-star ratings |
| No `subscription` model | Newsletter signup has no persistence |
| No `category` or `tag` models | Product filtering is limited to `roastLevel` and price |
| `price` is `Float` | Risk of floating-point precision issues; `Decimal` preferred for currency |

### Migration Status

- **Prisma migrations:** ❌ **NONE.** The `prisma/migrations/` directory does not exist. The schema has never been migrated via Prisma.
- **Database tables:** The Prisma schema exists only as a declaration. Tables must be created manually (via `prisma db push` or `prisma migrate dev`) or they don't exist in the connected Supabase PostgreSQL instance.
- **Supabase migrations:** 1 file exists (`20260617000001_enable_rls.sql`) — this enables RLS and defines policies for all 8 tables. This implies the tables were created through Supabase (either manually or via a prior migration). **This is out of sync** with Prisma — Prisma schema changes won't be reflected unless Prisma migrations are initialized.
- **Seed script:** Exists (`prisma/seed.ts` — 8 products), but has never been run (no migrations).
- **Risk:** The Prisma schema and the actual DB schema could be out of sync. Running `prisma db push` could overwrite or conflict with Supabase-managed tables.

---

## 3. Features Implemented (with Evidence)

### Route/Page Inventory

| Route | File | Status | Type | Notes |
|-------|------|--------|------|-------|
| `/` | `app/(public)/page.tsx` | ✅ **Complete** | Public | 7 sections: Hero, AboutSection, PopularPicks, FeaturesRibbon, Testimonials, FAQ, Newsletter |
| `/products` | `app/(public)/products/page.tsx` + `.client.tsx` | ✅ **Functional** | Public | Grid layout, filter by roast/price, mobile sidebar, uses DB products via Prisma |
| `/products/[slug]` | `app/(public)/products/[slug]/page.tsx` + `.client.tsx` | ⚠️ **Partial** | Public | Detail view works but uses **static** product data (`lib/products.ts`), not DB data; add-to-cart wired |
| `/about` | `app/(public)/about/page.tsx` + `.client.tsx` | ✅ **Complete** | Public | Company story, values (4 cards), team section |
| `/contact` | `app/(public)/contact/page.tsx` + `.client.tsx` | ⚠️ **Partial** | Public | Form UI + simulated send (no backend), info cards |
| `/cart` | `app/(public)/cart/page.tsx` + `.client.tsx` | ✅ **Functional** | Public | Items list, qty controls, remove/clear, subtotal, checkout link |
| `/checkout` | `app/(public)/checkout/page.tsx` + `.client.tsx` | ✅ **Functional** | Public | Customer info, shipping address, notes, COD payment, creates order |
| `/checkout/success` | `app/(public)/checkout/success/page.tsx` + `.client.tsx` | ✅ **Functional** | Public | Shows orderId, copy-to-clipboard, nav links |
| `/login` | `app/(auth)/login/page.tsx` + `.client.tsx` | ✅ **Complete** | Public | Supabase signInWithPassword, Zod validation, error handling |
| `/register` | `app/(auth)/register/page.tsx` + `.client.tsx` | ✅ **Complete** | Public | Supabase signUp, creates user in Prisma |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` + `.client.tsx` | ✅ **Complete** | Public | Supabase resetPasswordForEmail, success state |
| `/account` | `app/account/page.tsx` + `.client.tsx` | ✅ **Complete** | Protected | Profile info, sign out |
| `/account/reset-password` | `app/account/reset-password/page.tsx` + `.client.tsx` | ✅ **Complete** | Protected | Supabase updateUser, password match validation |
| `/admin` | `app/admin/page.tsx` | ✅ **Functional** | Admin | Dashboard: totalOrders, revenue, customers, products stats + quick links |
| `/admin/products` | `app/admin/products/page.tsx` | ✅ **Functional** | Admin | Full CRUD: search, inline create/edit/delete with modal form |
| `/admin/orders` | `app/admin/orders/page.tsx` | ✅ **Functional** | Admin | List orders, search, update status dropdown |
| `/auth/callback` | `app/auth/callback/route.ts` | ✅ **Complete** | API Route | OAuth code exchange + user sync |
| `/api/user/role` | `app/api/user/role/route.ts` | ✅ **Complete** | API Route | Returns user role by email |
| `/faqs` | — | ❌ **Missing** | — | Linked from footer, no route |
| `/shipping` | — | ❌ **Missing** | — | Linked from footer, no route |
| `/returns` | — | ❌ **Missing** | — | Linked from footer, no route |
| `/terms` | — | ❌ **Missing** | — | Linked from footer, no route |
| `/privacy` | — | ❌ **Missing** | — | Linked from footer, no route |

### Authentication

| Feature | Status | Details |
|---------|--------|---------|
| Email/password sign-up | ✅ Done | Supabase signUp + Prisma user creation |
| Email/password sign-in | ✅ Done | Supabase signInWithPassword |
| OAuth callback | ✅ Done | Code exchange + DB sync |
| Password reset (forgot) | ✅ Done | Sends reset email via Supabase |
| Password reset (update) | ✅ Done | updateUser after redirect |
| Session management | ✅ Done | Supabase SSR cookies |
| Auth middleware | ✅ Done | `proxy.ts` protects `/account/*` and `/admin/*` |
| Role-based access (ADMIN) | ✅ Done | Admin layout checks role via `/api/user/role` |
| Sign out | ✅ Done | Supabase signOut |

### Cart & Checkout Flow

| Stage | Status | Details |
|-------|--------|---------|
| Add to cart | ✅ Done | Client-side via localStorage context; syncs to Prisma for logged-in users |
| Cart page | ✅ Done | View, quantity +/- , remove, clear |
| Cart persistence (guest) | ✅ Done | localStorage |
| Cart persistence (logged in) | ✅ Done | Prisma CartItem model via server actions |
| Cart merge on login | ✅ Done | `mergeServerCart` action merges local -> server |
| Checkout form | ✅ Done | Collects name, email, phone, address, notes |
| Order creation | ✅ Done | `createOrder` server action (transactional) |
| Order success page | ✅ Done | Shows order ID, confirmation |
| Guest checkout | ✅ Done | Creates user with `guest_` supabaseId |

### Payment Integration

| Feature | Status | Details |
|---------|--------|---------|
| Cash on Delivery | ✅ Implemented | Hardcoded as only payment option |
| **Paymob integration** | ❌ **NOT implemented** | No references to Paymob anywhere in the codebase |
| **Any payment gateway** | ❌ **NOT implemented** | No Stripe, no Paymob, no webhooks, no iframe, no tokenization |
| **Payment webhook** | ❌ **NOT implemented** | No `/api/webhook` or similar endpoint exists |
| **Payment status updates** | ❌ **NOT implemented** | Status is hardcoded to "UNPAID" and never changes |

### Admin Panel

| Feature | Status | Details |
|---------|--------|---------|
| Dashboard stats | ✅ Done | Total orders, revenue, customers, products |
| Product CRUD | ✅ Done | Create, read, update, delete with modal form |
| Order management | ✅ Done | List, search, update status |
| User management | ❌ Missing | Not implemented |
| Role management | ❌ Missing | Not implemented |

### Noteworthy Progress vs PROGRESS_REPORT.md

The existing `PROGRESS_REPORT.md` (dated 2026-06-17) is **stale** — it reports `/products`, `/cart`, `/checkout`, `/about`, `/contact`, `/admin/products`, `/admin/orders`, `/account/reset-password` as missing, but **all of these routes now exist and are functional**.

---

## 4. What's Missing / Incomplete

### Phase Comparison (Inferred Roadmap from PROGRESS_REPORT.md)

| Phase | Description | Est. Progress | Actual Progress |
|-------|-------------|:---:|:---:|
| Phase 0: Foundation | Scaffold, DB schema, auth, theme, layouts | 100% | 100% ✅ |
| Phase 1: Content & Static Pages | Catalog pages, about, contact, legal | 15% | **75%** — home, products (2 views), about, contact done; 5 legal/help pages missing |
| Phase 2: E-Commerce Core | Cart, checkout, orders, payments | 5% | **70%** — cart, checkout, orders done; **payment gateway = 0%** |
| Phase 3: Admin Panel | CRUD for products, orders, users | 5% | **70%** — products & orders CRUD done; user/role management missing |
| Phase 4: Features & Polish | Wishlist, reviews, search, SEO, perf | 0% | **10%** — DB schema exists for reviews/wishlist but no UI; no search; no SEO |

**Overall Project Completion (revised): ~55%**

### Detailed Missing Items

#### Legal & Help Pages (5 missing routes — linked from Footer)
- `/faqs`, `/shipping`, `/returns`, `/terms`, `/privacy`

#### Payment Gateway (critical blocker)
- No Paymob, Stripe, or any payment integration
- Only Cash on Delivery is implemented
- No payment webhook endpoint
- No payment status lifecycle management

#### Dual Product Data Sources
- **Server components** (`/products` listing) query Prisma DB via `lib/db-products.ts`
- **Client components** (`/products/[slug]`) use static array from `lib/products.ts`
- If DB is empty or seeded differently, the listing and detail pages will show different products
- The static data array in `lib/products.ts` is 197 lines of hardcoded data that duplicates what should come from the DB

#### Product Images
- Images reference Unsplash URLs (configured in `next.config.ts`) — these are real
- The `FeaturedProducts` component references `/images/coffee-1.jpg` (local files) — these files **do not exist** in `public/`

#### Newsletter
- The Newsletter component simulates submission with a 1-second setTimeout
- No backend persistence — no subscription model, no API endpoint

#### Orphan Components
- `components/home/FeaturedProducts.tsx` — Arabic-language component, not imported anywhere
- `components/pixel-perfect-hero.tsx` — Canvas animation hero, not imported anywhere

#### Missing Server Action / API Capabilities
- No `updateUser` or profile management endpoint
- No address management CRUD (model exists, no UI)
- No wishlist add/remove/list endpoints
- No review create/list endpoints

#### Missing Environment Variables
- All env vars referenced in code are present in `.env`:
  - `DATABASE_URL` ✅
  - `NEXT_PUBLIC_SUPABASE_URL` ✅
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` is in `.env` but **never referenced** in any source file — dead config

#### No TODOs / FIXMEs / HACKs
- Zero found in the entire codebase. This is unusual and may indicate incomplete code review practices.

---

## 5. Known Issues / Risks

### Security Concerns

| Issue | Severity | Detail |
|-------|----------|--------|
| **`.env` committed to repo** | 🔴 **CRITICAL** | The `.env` file is NOT in `.gitignore` (`.gitignore` only ignores `.env*` but the file exists on disk). If this repo is public or shared, **database credentials and Supabase API keys are exposed**. |
| **Service role key in `.env`** | 🔴 **CRITICAL** | `SUPABASE_SERVICE_ROLE_KEY` provides full admin access to Supabase. Even though it's not used in code yet, it's exposed in plaintext. |
| **Server action authorization** | 🟡 **MEDIUM** | Admin server actions (`actions/admin.ts`) do not check user role — they rely on the caller not having access. A user could craft a request to call these server actions directly. |
| **`createUserInDB` upserts without auth check** | 🟡 **MEDIUM** | The `auth.ts` server action can create/upsert any user by supabaseId with no authorization. |
| **`createOrder` creates guest users** | 🟡 **MEDIUM** | Line in `actions/orders.ts` creates users with `guest_` prefixed supabaseId on guest checkout — these users have no actual Supabase auth record, creating orphaned Prisma users. |
| **No input sanitization on order notes** | 🟢 **LOW** | `notes` field in checkout is a free-text string stored as-is. |

### Bugs & Inconsistencies

| Issue | Detail |
|-------|--------|
| **Testimonial arrow icons reversed** | `components/home/Testimonials.tsx`: "prev" button uses `ChevronRight`, "next" button uses `ChevronLeft` |
| **Product detail uses static data** | `/products/[slug]` reads from `lib/products.ts` static array, not from the database — mismatch with listing page |
| **No Prisma migrations** | Schema changes cannot be tracked or versioned; `prisma/` and `supabase/` migrations are separate systems that could conflict |
| **Admin server action returns `order.map is not a function` risk** | `getOrders` in `actions/admin.ts` returns `{ orders, stats }` — consumer expects `orders` to be an array but Zod validation is absent at the network boundary |
| **`updateProduct` in admin accepts partial data** | Could overwrite fields with `undefined` if the admin form submits incomplete data |
| **`FeaturedProducts` local image paths** | References `/images/coffee-1.jpg`, `/images/coffee-2.jpg`, `/images/coffee-3.jpg` — none exist in `public/` |

### Architecture & Technical Debt

| Issue | Detail |
|-------|--------|
| **Mixed product data sources** | `lib/db-products.ts` (Prisma) vs `lib/products.ts` (static). Server components and client components use different sources. |
| **`weightOptions` is `Json` type** | No validation or type safety — can store anything |
| **`paymentStatus` could be an enum** | Currently a freeform `String` — risk of inconsistent values |
| **Float for price** | `Float` can cause rounding errors; `Decimal` is preferred for currency |
| **Newsletter is fake** | `setTimeout` simulates API call — no actual storage |
| **`supabase/middleware.ts` not found** | Referenced in the audit request but does not exist; no file imports it either, so this is only a missing file if someone tries to import it |

---

## 6. Next Steps Recommendations

Ordered by dependency/unblocking priority:

### 1. 🔴 Initialize Prisma Migrations & Sync DB
**Why:** The Prisma schema has 7 models but zero migrations. The actual PostgreSQL database may not match. Run `prisma migrate dev --name init` to create the first migration, then `prisma db seed` to populate products. This unblocks **all** DB-dependent features.
- Verify the existing Supabase RLS migration doesn't conflict
- Set up proper migration workflow going forward

### 2. 🔴 Implement Real Payment Gateway (Paymob)
**Why:** The entire revenue-gen path is blocked. Only Cash on Delivery exists. Without it:
- The checkout flow is a dead end (orders stay UNPAID forever)
- No payment webhooks → no payment status lifecycle
- No payment confirmation/refund handling
- Implement Paymob iframe integration, webhook handler at `/api/webhook/paymob`, and payment status transitions

### 3. 🟡 Unify Product Data Sources
**Why:** The products listing page reads from Prisma, but the product detail page reads from a static array. This causes inconsistent data display. Refactor `/products/[slug]` to query Prisma (via `lib/db-products.ts`) instead of `lib/products.ts`.

### 4. 🟡 Build Legal & Help Pages
**Why:** 5 routes (`/faqs`, `/shipping`, `/returns`, `/terms`, `/privacy`) are linked from the Footer but return 404s. This is a poor user experience. These are straightforward static/markdown pages.

### 5. 🟡 Add Server Action Authorization Checks
**Why:** Admin server actions (`actions/admin.ts`) have no authorization checks. A malicious user who can call server actions (e.g., via Next.js server action protocol) can create/update/delete products and update order statuses without being an admin. Add role verification at the start of each admin action.

### Honorable Mentions (after top 5)
- 🔵 Add address management UI (model exists, no pages)
- 🔵 Add wishlist UI (model exists, no pages)
- 🔵 Add review UI (model exists, no pages)
- 🔵 Build newsletter backend (subscribe endpoint + DB model)
- 🔵 Move `.env` to `.env.local` and add to `.gitignore`
- 🔵 Fix swapped testimonial arrow icons
- 🔵 Remove or wire up orphan components (FeaturedProducts, PixelHero)
- 🔵 Add SEO metadata to all public pages
- 🔵 Remove unused `SUPABASE_SERVICE_ROLE_KEY` or use it properly

---

*Report generated by static codebase analysis on 2026-07-02. Some findings (e.g., runtime errors, build failures) could only be confirmed by running the application.*
