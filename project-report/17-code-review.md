# 17 — Code Review

## Large Files

| File | Lines | Concern |
|------|-------|---------|
| `app/admin/products/page.tsx` | ~544 | Contains full CRUD table + modal form in one file. Should be split into separate components. |
| `app/(public)/checkout/page.client.tsx` | ~400+ | Checkout form with all fields, validation, map picker integration, order summary. Borderline manageable. |
| `actions/orders.ts` | ~388 | Two order creation functions with extensive logging. The `createCardOrder` function alone is ~200 lines. |
| `lib/cart-context.tsx` | ~184 | Cart provider with dual-mode sync. Complex but well-contained. |
| `components/layout/Navbar.tsx` | ~200+ | Navigation with auth state, mobile menu, user dropdown. Could extract dropdown. |
| `prisma/seed.ts` | ~160 | Long due to verbose product descriptions. Acceptable for seed data. |

## Duplicate Code

### 1. Checkout Form Input Pattern (Repeated 7+ Times)
**Files:** `app/(public)/checkout/page.client.tsx`
```tsx
// This exact pattern appears 7 times:
<div className="space-y-1.5">
  <label htmlFor="xxx" className="text-xs font-medium text-text-secondary uppercase tracking-wider">
    Label *
  </label>
  <input id="xxx" ... className="w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300" />
</div>
```
**Fix:** Extract a `<FormInput>` component.

### 2. Auth Form Input Pattern (Repeated 3+ Times)
**Files:** `app/(auth)/login/page.client.tsx`, `app/(auth)/register/page.client.tsx`, `app/(auth)/forgot-password/page.client.tsx`
```tsx
// Same input pattern with slight variations:
<input className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.xxx ? "border-red-500/60" : "border-border"} ...`} />
```
**Fix:** Extract shared auth form input component.

### 3. Admin Table Header Pattern
**Files:** `app/admin/products/page.tsx`, `app/admin/orders/page.tsx`
```tsx
<th className="text-left px-5 py-4 text-text-muted font-medium text-xs uppercase tracking-wider">
```
**Fix:** Extract `<TableHeader>` component.

### 4. Empty State Pattern
**Files:** `app/(public)/checkout/page.client.tsx` (two places)
```tsx
<div className="min-h-screen bg-background flex items-center justify-center px-6">
  <motion.div ... className="text-center space-y-6 max-w-md">
    <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center mx-auto">
      <Package className="w-10 h-10 text-text-muted" />
    </div>
    <h1 className="text-3xl font-serif text-text-primary">Title</h1>
    ...
  </motion.div>
</div>
```

### 5. Cart Context Method Pattern
**File:** `lib/cart-context.tsx`
```tsx
// addItem, removeItem, updateQuantity all follow the same pattern:
const method = useCallback((...) => {
  setItems(prev => /* local update */)
  if (userId) { serverAction(userId, ...).catch(console.error) }
}, [items, userId])
```

## Dead Code

| Item | Location | Status |
|------|----------|--------|
| `Address` model | `prisma/schema.prisma` | Schema exists, never used by any code |
| `Review` model | `prisma/schema.prisma` | Schema exists, no UI or server action |
| `Wishlist` model | `prisma/schema.prisma` | Schema exists, no UI or server action |
| `react-hook-form` | `package.json` | Installed, never imported |
| `@hookform/resolvers` | `package.json` | Installed, never imported |
| `clsx` | `package.json` | Installed, never imported |
| `tailwind-merge` | `package.json` | Installed, never imported |
| `sonner` Toaster | `app/layout.tsx` | Rendered but no toast calls found |
| `Photos/` directory | Root | Contains source product photos not used by the app |
| `next.config.zip` | Root | Unknown purpose, likely a backup |
| `proxy.ts` | Root | Named `proxy.ts` instead of `middleware.ts` — unclear if wired up |

## Code Smells

### 1. No Shared Components
Every page re-implements the same input, button, card, and table patterns from scratch. There are **zero shared UI components** (no `components/ui/` directory).

### 2. Client Components Where Server Would Suffice
Several pages are wrapped as client components unnecessarily:
- `app/(public)/shipping/page.client.tsx` — Static content, could be a server component
- `app/(public)/terms/page.client.tsx` — Static content
- `app/(public)/privacy/page.client.tsx` — Static content
- `app/(public)/returns/page.client.tsx` — Static content
- `app/(public)/faqs/page.client.tsx` — Has search state, but data is hardcoded

### 3. Inline Styling via String Literals
The same Tailwind class strings are repeated dozens of times across files with no abstraction.

### 4. Extensive Console Logging in Production Code
`actions/orders.ts` has ~150 lines of `console.log` statements in the `createCardOrder` function. These run in production.

### 5. Hardcoded Data in Components
Testimonials, FAQ items, features, and contact information are hardcoded directly in component files instead of being in a data file or CMS.

## Anti-Patterns

### 1. Missing Server-Side Validation
Server actions accept input without validating it:
```typescript
// actions/orders.ts
export async function createOrder(input: CreateOrderInput) {
  // No validation — trusts client input completely
  const user = await prisma.user.upsert(...)
}
```

### 2. No Error Boundaries
No `error.tsx` files exist anywhere in the app. Unhandled errors will crash the entire page.

### 3. No Loading States
No `loading.tsx` files exist. Users see nothing while server components fetch data.

### 4. Mixing Concerns in Admin Pages
Admin pages contain table rendering, form handling, state management, and data fetching all in one file.

## Tight Coupling

| Coupling | Files | Issue |
|----------|-------|-------|
| Checkout ↔ Cart | `page.client.tsx` ↔ `cart-context.tsx` | Checkout directly accesses cart context internals |
| Navbar ↔ Auth + Cart + Role API | `Navbar.tsx` | Single component depends on Supabase, cart context, and an API route |
| Admin layout ↔ Auth + Role API | `admin/layout.tsx` | Auth guard logic mixed with layout rendering |

## Low Cohesion

| Module | Issue |
|--------|-------|
| `actions/orders.ts` | Handles user creation, order creation, Paymob integration, and payment verification — should be split |
| `admin/products/page.tsx` | Handles CRUD table, search, modal form, image preview, and API calls |
| `lib/cart-context.tsx` | Handles cart state, localStorage sync, server sync, and auth integration |
