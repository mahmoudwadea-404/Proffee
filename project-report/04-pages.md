# 04 — Pages

## Complete Page Registry

| # | Page Name | Route | File Location | Purpose | Layout | Data Source | Access |
|---|-----------|-------|---------------|---------|--------|-------------|--------|
| 1 | Homepage | `/` | `app/(public)/page.tsx` → `page.client.tsx` | Landing page with hero, featured products, testimonials | `(public)` (Navbar + Footer) | `getFeaturedProducts()` server component | Public |
| 2 | Products Listing | `/products` | `app/(public)/products/page.tsx` → `page.client.tsx` | Browse all products with roast level filter | `(public)` | `getProducts()` + `getRoastLevels()` server | Public |
| 3 | Product Detail | `/products/[slug]` | `app/(public)/products/[slug]/page.tsx` → `page.client.tsx` | Single product detail with weight selection, reviews, Buy Now | `(public)` | `getProductBySlug()` + `getProducts()` (related) server | Public |
| 4 | Cart | `/cart` | `app/(public)/cart/page.tsx` → `page.client.tsx` | Shopping cart with quantity controls | `(public)` | Cart Context (localStorage/server) | Public |
| 5 | Checkout | `/checkout` | `app/(public)/checkout/page.tsx` → `page.client.tsx` | Shipping form, payment method, order summary | `(public)` | Cart Context + form state | Public |
| 6 | Order Success | `/checkout/success` | `app/(public)/checkout/success/page.tsx` → `page.client.tsx` | Order confirmation with order ID | `(public)` | URL search params (`orderId`) | Public |
| 7 | Payment Result | `/checkout/payment-result` | `app/(public)/checkout/payment-result/page.tsx` → `page.client.tsx` | Payment status polling after Paymob redirect | `(public)` | `GET /api/orders/[id]/payment-status` polling | Public |
| 8 | About | `/about` | `app/(public)/about/page.tsx` → `page.client.tsx` | Brand story and team page | `(public)` | Hardcoded content | Public |
| 9 | Contact | `/contact` | `app/(public)/contact/page.tsx` → `page.client.tsx` | Contact form (simulated) | `(public)` | Form state | Public |
| 10 | FAQs | `/faqs` | `app/(public)/faqs/page.tsx` → `page.client.tsx` | FAQ page with search/filter | `(public)` | Hardcoded FAQ data | Public |
| 11 | Shipping Info | `/shipping` | `app/(public)/shipping/page.tsx` → `page.client.tsx` | Shipping policy info page | `(public)` | Hardcoded content | Public |
| 12 | Terms | `/terms` | `app/(public)/terms/page.tsx` → `page.client.tsx` | Terms and conditions | `(public)` | Hardcoded content | Public |
| 13 | Privacy | `/privacy` | `app/(public)/privacy/page.tsx` → `page.client.tsx` | Privacy policy | `(public)` | Hardcoded content | Public |
| 14 | Returns | `/returns` | `app/(public)/returns/page.tsx` → `page.client.tsx` | Returns and refunds policy | `(public)` | Hardcoded content | Public |
| 15 | Login | `/login` | `app/(auth)/login/page.tsx` → `page.client.tsx` | Email/password login form | `(auth)` (centered card) | Supabase Auth | Public |
| 16 | Register | `/register` | `app/(auth)/register/page.tsx` → `page.client.tsx` | Registration form with email verification | `(auth)` (centered card) | Supabase Auth | Public |
| 17 | Forgot Password | `/forgot-password` | `app/(auth)/forgot-password/page.tsx` → `page.client.tsx` | Password reset email form | `(auth)` (centered card) | Supabase Auth | Public |
| 18 | Account | `/account` | `app/account/page.tsx` → `page.client.tsx` | User account dashboard | None (standalone) | Supabase session + `GET /api/user/role` | **Protected** |
| 19 | Reset Password | `/account/reset-password` | `app/account/reset-password/page.tsx` → `page.client.tsx` | Set new password (post-reset) | None (standalone) | Supabase Auth | Public (token-gated) |
| 20 | Admin Dashboard | `/admin` | `app/admin/page.tsx` | Stats overview (orders, revenue, customers, products) | `admin/layout.tsx` (sidebar) | `getStats()` server action | **Protected** (ADMIN) |
| 21 | Admin Products | `/admin/products` | `app/admin/products/page.tsx` | Product CRUD with image upload modal | `admin/layout.tsx` (sidebar) | `getProducts()` server action | **Protected** (ADMIN) |
| 22 | Admin Orders | `/admin/orders` | `app/admin/orders/page.tsx` | Order list with status management | `admin/layout.tsx` (sidebar) | `getOrders()` server action | **Protected** (ADMIN) |

## API Routes

| Route | Method | File | Purpose | Auth |
|-------|--------|------|---------|------|
| `/api/user/role` | GET | `app/api/user/role/route.ts` | Returns user role by email | None (internal) |
| `/api/orders/[id]/payment-status` | GET | `app/api/orders/[id]/payment-status/route.ts` | Returns payment status for polling | None (internal) |
| `/api/webhooks/paymob` | POST | `app/api/webhooks/paymob/route.ts` | Receives Paymob payment notifications | HMAC verified |
| `/auth/callback` | GET | `app/auth/callback/route.ts` | OAuth email verification callback | Supabase code exchange |

## Layout Hierarchy

```
app/layout.tsx  ←  CartProvider + fonts (Playfair, Inter, Great Vibes) + Toaster
│
├── (auth)/layout.tsx  ←  Centered card, Proffee logo, dark background
│   └── /login, /register, /forgot-password
│
├── (public)/layout.tsx  ←  Navbar + main + Footer
│   └── /, /about, /products, /cart, /checkout, etc.
│
├── admin/layout.tsx  ←  Sidebar nav (Dashboard/Products/Orders) + auth guard
│   └── /admin, /admin/products, /admin/orders
│
├── (no layout)  ←  /account (standalone)
└── (no layout)  ←  /account/reset-password (standalone)
```

## Metadata

| Page | Metadata Strategy |
|------|-------------------|
| `/products/[slug]` | Dynamic via `generateMetadata()` (title + description from DB) |
| All other pages | Static via `export const metadata` in `page.tsx` |
