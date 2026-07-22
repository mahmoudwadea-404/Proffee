# 18 — Improvement Plan

## High Priority

### 1. Add Server-Side Input Validation
**Impact:** Prevents malicious data, reduces database errors, ensures data integrity.
**Effort:** Medium
**Files:** `actions/orders.ts`, `actions/admin.ts`, `actions/cart.ts`

- Add Zod validation to all server actions
- Validate email format, phone format, required fields, data types
- Return structured error responses instead of raw Prisma errors
- Validate order amounts match expected calculations

### 2. Add Auth Checks to Server Actions
**Impact:** Prevents unauthorized access to admin operations.
**Effort:** Medium
**Files:** `actions/admin.ts`, all server action files

- Verify user session in all admin server actions
- Verify user owns the cart/order in cart and order actions
- Add role-based checks: only ADMIN can call `getOrders`, `updateOrderStatus`, `deleteProduct`, etc.

### 3. Replace `<img>` with `next/image`
**Impact:** Automatic image optimization, lazy loading, WebP conversion, responsive sizing.
**Effort:** Low-Medium
**Files:** `components/home/Hero.tsx`, `components/home/PopularPicks.tsx`, `components/home/AboutSection.tsx`, `app/(public)/products/[slug]/page.client.tsx`, `app/(public)/cart/page.client.tsx`, `app/(public)/checkout/page.client.tsx`

- Replace all `<img>` tags with `<Image>` from `next/image`
- Configure `sizes` prop for responsive loading
- Add `placeholder="blur"` with tiny base64 placeholders

### 4. Add `loading.tsx` and `error.tsx` Files
**Impact:** Better user experience during loading and error states.
**Effort:** Low
**Files:** New `loading.tsx` and `error.tsx` in key route directories

- Add `app/(public)/loading.tsx` for public pages
- Add `app/admin/loading.tsx` for admin pages
- Add `error.tsx` at route group levels for error recovery

### 5. Remove Unused Dependencies
**Impact:** Reduce bundle size by ~25KB gzipped.
**Effort:** Low
**Files:** `package.json`

- Remove `react-hook-form`, `@hookform/resolvers`, `clsx`, `tailwind-merge` (or adopt them)
- Audit `sonner` usage

## Medium Priority

### 6. Extract Shared UI Components
**Impact:** DRY code, consistent styling, easier maintenance.
**Effort:** Medium
**Files:** New `components/ui/` directory

Create reusable components:
- `<FormInput>` — label + input with consistent styling
- `<FormSelect>` — label + select dropdown
- `<Button>` — primary/secondary/ghost variants
- `<Card>` — surface container
- `<Table>`, `<TableHeader>`, `<TableRow>`, `<TableCell>` — admin tables
- `<Modal>` — overlay dialog (used in admin products, checkout map)
- `<EmptyState>` — icon + message + CTA
- `<StatusBadge>` — colored status indicator

### 7. Split Large Admin Pages
**Impact:** Better maintainability, testability, and code organization.
**Effort:** Medium
**Files:** `app/admin/products/page.tsx`, `app/admin/orders/page.tsx`

- Extract `ProductFormModal` component from products page
- Extract `OrderStatusDropdown` component from orders page
- Extract `AdminTable` generic component
- Move form state management to custom hooks

### 8. Add Pagination to Admin
**Impact:** Prevent performance issues with large datasets.
**Effort:** Medium
**Files:** `actions/admin.ts`, `app/admin/products/page.tsx`, `app/admin/orders/page.tsx`

- Add `skip`/`take` parameters to `getOrders()` and `getProducts()`
- Add pagination controls in admin UI
- Default to 20 items per page

### 9. Implement Review System
**Impact:** Customer trust, product social proof. Model already exists in schema.
**Effort:** Medium-High
**Files:** New server actions, product detail page

- Create `actions/reviews.ts` with create/list functionality
- Add review form to product detail page
- Display reviews with star ratings
- Add average rating to product cards

### 10. Add Wishlist Functionality
**Impact:** Customer engagement, repeat purchases. Model already exists in schema.
**Effort:** Medium
**Files:** New context/hook, server actions, product pages

- Create wishlist server actions
- Add "Add to Wishlist" button on product cards
- Add wishlist page
- Add heart icon toggle in Navbar

### 11. Clean Up Debug Logging
**Impact:** Reduce production log noise, prevent potential data leakage.
**Effort:** Low
**Files:** `actions/orders.ts`, `app/api/webhooks/paymob/route.ts`

- Guard all `console.log` statements with `process.env.NODE_ENV === "development"`
- Or use a proper logging library with log levels
- Remove `createCardOrder` verbose logging (150+ lines)

### 12. Adopt `react-hook-form` for Forms
**Impact:** Better form handling, validation, and error display. Already installed.
**Effort:** Medium
**Files:** All form pages

- Replace `useState` form management with `react-hook-form`
- Integrate Zod resolver for validation
- Use `useForm` hook for form state, errors, submission
- Apply to: checkout, login, register, forgot-password, admin product form, contact

## Low Priority

### 13. Add Order History to Account Page
**Impact:** Customer self-service, reduced support queries.
**Effort:** Medium
**Files:** `app/account/page.client.tsx`, new server action

- Query orders by userId
- Display order list with status, date, total
- Link to order detail (if implemented)

### 14. Add Saved Addresses
**Impact:** Faster checkout for returning customers. `Address` model already exists.
**Effort:** Medium
**Files:** `app/account/`, `app/(public)/checkout/`, new server actions

- CRUD for saved addresses
- Auto-fill checkout with default address
- Address book in account page

### 15. Implement Newsletter Backend
**Impact:** Actual email collection instead of simulated.
**Effort:** Low-Medium
**Files:** `components/home/Newsletter.tsx`, new API route or service

- Connect to email service (Mailchimp, Resend, etc.)
- Store subscribers in database or external service
- Add unsubscribe flow

### 16. Add SEO Metadata to All Pages
**Impact:** Better search engine visibility.
**Effort:** Low
**Files:** All `page.tsx` files

- Add `title`, `description`, `openGraph` to all pages
- Add structured data (JSON-LD) for products
- Add sitemap generation

### 17. Add `robots.txt` and Sitemap
**Impact:** Search engine crawling control.
**Effort:** Low
**Files:** New `app/robots.ts`, `app/sitemap.ts`

### 18. Add Unit Tests
**Impact:** Code reliability, regression prevention.
**Effort:** High
**Files:** New `__tests__/` directories

- Test server actions (order creation, cart operations)
- Test validation schemas
- Test cart context logic
- Test component rendering

### 19. Add Error Monitoring
**Impact:** Production error visibility.
**Effort:** Low-Medium

- Integrate Sentry, LogRocket, or similar
- Capture client-side errors
- Capture server action errors
- Performance monitoring

### 20. Convert Static Pages to Server Components
**Impact:** Reduced client-side JavaScript, faster initial load.
**Effort:** Low
**Files:** `app/(public)/shipping/page.client.tsx`, `app/(public)/terms/page.client.tsx`, `app/(public)/privacy/page.client.tsx`, `app/(public)/returns/page.client.tsx`

- These pages have no interactivity — they can be pure server components
- Only `faqs/page.client.tsx` needs to stay client (has search state)
