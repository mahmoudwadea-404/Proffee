# 19 — Refactoring Suggestions

## Better Architecture

### 1. Create a Shared UI Component Library

**Current state:** Zero shared components. Every page copy-pastes the same Tailwind classes.

**Suggestion:** Create `components/ui/` with primitives:

```
components/ui/
├── Button.tsx          # variant: primary | secondary | ghost | danger
├── Input.tsx           # with label, error state, required indicator
├── Select.tsx          # with label, options, native <select> styling
├── Card.tsx            # surface container with consistent padding/border
├── Modal.tsx           # overlay dialog with backdrop, header, close button
├── Badge.tsx           # status indicators (order status, featured)
├── Table.tsx           # responsive table with header, row, cell
├── EmptyState.tsx      # icon + message + optional CTA
├── Spinner.tsx         # loading indicator
└── cn.ts               # clsx + tailwind-merge utility (if keeping those packages)
```

**Impact:** High — reduces code duplication by ~30%, ensures visual consistency, makes styling changes trivial.

### 2. Separate Data Fetching from Components

**Current state:** Admin pages fetch data inside `useEffect` hooks mixed with UI code.

**Suggestion:** Use Next.js Server Components for data fetching where possible, or extract data fetching into custom hooks:

```
// Instead of inline useEffect in admin pages:
hooks/
├── useOrders.ts        # Wraps getOrders() with loading/error state
├── useProducts.ts      # Wraps getProducts() with loading/error state
├── useStats.ts         # Wraps getStats() with loading/error state
└── useAuth.ts          # Auth state + role check (currently inline in Navbar and admin layout)
```

**Impact:** Medium — cleaner separation of concerns, reusable data fetching logic.

### 3. Extract Auth Logic

**Current state:** Auth checks are scattered across Navbar, admin layout, account page, and middleware — each implementing their own pattern.

**Suggestion:**
- Create `hooks/useAuth.ts` that wraps Supabase session + role check
- Create `lib/auth.ts` server utility for auth verification in server actions
- Standardize the auth check pattern

### 4. Split `actions/orders.ts`

**Current state:** 388 lines handling user creation, COD orders, card orders, Paymob integration, and payment verification.

**Suggestion:**
```
actions/
├── orders/
│   ├── create.ts       # createOrder() + createCardOrder()
│   ├── types.ts        # CreateOrderInput, HandlePaymentRedirectInput
│   └── payment.ts      # handlePaymentRedirect()
```

Or keep as one file but extract the Paymob-specific logic:
```
lib/
├── paymob-orders.ts    # Order-specific Paymob integration
```

## Better Folder Organization

### 5. Move Cart Context to Components Directory

**Current state:** `lib/cart-context.tsx` is a React component but lives in `lib/`.

**Suggestion:** Move to `contexts/cart-context.tsx` or `components/providers/cart-provider.tsx`.

### 6. Create a Types Directory Structure

**Current state:** Only `types/auth.ts` exists. Types are scattered across files.

**Suggestion:**
```
types/
├── auth.ts             # Login/register schemas (existing)
├── order.ts            # CreateOrderInput, OrderStatus, etc.
├── product.ts          # Product, FeaturedProduct, WeightOption
├── cart.ts             # CartItem, CartContextValue
└── admin.ts            # ProductInput, OrderWithItems
```

### 7. Organize API Routes

**Current state:** API routes are flat with nested folders only for dynamic segments.

**Suggestion:** Consolidate related routes and add consistent error handling:

```
app/api/
├── health/route.ts     # Health check endpoint
├── user/
│   └── role/route.ts   # (existing)
├── orders/
│   └── [id]/
│       └── payment-status/route.ts  # (existing)
└── webhooks/
    └── paymob/route.ts # (existing)
```

## Component Splitting

### 8. Split Navbar

**Current state:** 200+ lines with auth state, mobile menu, and user dropdown.

**Suggestion:**
```
components/layout/
├── Navbar.tsx          # Main nav container + layout
├── NavLinks.tsx        # Desktop navigation links
├── CartBadge.tsx       # Cart icon with count
├── UserMenu.tsx        # Auth dropdown (admin link, account, sign out)
├── MobileMenu.tsx      # Slide-in mobile navigation
└── Footer.tsx          # (existing)
```

### 9. Split Admin Products Page

**Current state:** 544 lines with table, search, CRUD modal, and form.

**Suggestion:**
```
app/admin/products/
├── page.tsx            # Thin wrapper
├── ProductTable.tsx    # Table with search
├── ProductFormModal.tsx # Create/edit form
└── ProductRow.tsx      # Individual table row
```

### 10. Split Checkout Form

**Current state:** Single 400+ line component with all sections.

**Suggestion:**
```
app/(public)/checkout/
├── page.tsx
├── page.client.tsx     # Orchestrator
├── CustomerInfoSection.tsx
├── ShippingSection.tsx
├── PaymentSection.tsx
└── OrderSummary.tsx
```

## Performance Improvements

### 11. Memoize Cart Context Consumers

**Current state:** Every cart update re-renders all consumers.

**Suggestion:**
- Wrap `useCart` return value in `useMemo`
- Use selector pattern (like Zustand) so consumers only re-render when their specific slice changes
- Or migrate to Zustand for automatic selector-based rendering

### 12. Lazy-Load Framer Motion

**Current state:** `framer-motion` (~120KB) loaded on every page.

**Suggestion:**
- Use dynamic import for heavy animation components
- Use CSS animations for simple fade-in/slide-in effects
- Only load framer-motion on pages that need complex animations (homepage, product detail)

### 13. Add React.memo to Pure Components

**Suggestion:** Wrap components that receive the same props frequently:
- `PopularPicks` product cards
- `Testimonials` slide content
- Admin table rows
- Cart item rows

## Scalability Improvements

### 14. Implement Proper State Management

**Current state:** React Context for cart, `useState` for everything else.

**Suggestion for growth:**
- Cart → Zustand (lightweight, selector-based)
- Auth → Zustand or dedicated auth store
- Admin data → Server Components + Suspense (eliminate client-side fetching)

### 15. Add Database Indexes

**Current state:** Only Prisma default indexes on FK fields.

**Suggestion:**
```prisma
model Order {
  // Add indexes for common queries:
  @@index([userId])
  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt])
  @@index([paymobOrderId])
}

model Product {
  @@index([featured])
  @@index([roastLevel])
  @@index([slug])
}
```

### 16. Implement Caching Strategy

**Current state:** No caching — every page load queries the database.

**Suggestion:**
- Use Next.js `unstable_cache` for product listings (invalidate on admin update)
- Use `revalidateTag` / `revalidatePath` for cache invalidation
- Cache Paymob API responses where appropriate
- Add `Cache-Control` headers for static pages
