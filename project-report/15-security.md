# 15 — Security Review

## Authentication Security

| Check | Status | Notes |
|-------|--------|-------|
| Password minimum length | ✅ | 6 characters (Zod schema) |
| Password complexity | ⚠️ | No uppercase/number/special requirements |
| Session management | ✅ | Supabase cookie-based with auto-refresh |
| Email verification | ⚠️ | Supabase sends emails but app doesn't enforce `email_confirmed_at` |
| Rate limiting on login | ❌ | No rate limiting |
| Account lockout | ❌ | No lockout after failed attempts |

## Authorization

| Check | Status | Notes |
|-------|--------|-------|
| Route protection (middleware) | ✅ | `/account/*` and `/admin/*` require auth session |
| Admin role check | ⚠️ | Client-side only (in `admin/layout.tsx`), not in middleware |
| API endpoint auth | ⚠️ | `/api/user/role` has no auth check (email-based lookup) |
| API endpoint auth | ⚠️ | `/api/orders/[id]/payment-status` has no auth check |
| Server action auth | ❌ | No auth checks in server actions (anyone can call `createOrder`, `getOrders`, etc.) |
| Row-level security | ⚠️ | Supabase RLS migration exists (`20260617000001_enable_rls.sql`) but Prisma bypasses it |

## Environment Variables

| Check | Status | Notes |
|-------|--------|-------|
| Secrets in `.env` | ⚠️ | `.env` file tracked in git (`.gitignore` has `.env*` but file exists) |
| `.env.example` missing | ❌ | No template for required environment variables |
| Public vs private vars | ✅ | Supabase public keys use `NEXT_PUBLIC_` prefix |
| PAYMOB_PUBLIC_KEY exposure | ⚠️ | Key name suggests public but is only used server-side |

## XSS (Cross-Site Scripting)

| Check | Status | Notes |
|-------|--------|-------|
| React auto-escaping | ✅ | React escapes JSX expressions by default |
| `dangerouslySetInnerHTML` | ✅ | Not used anywhere in the codebase |
| User input rendering | ✅ | All user input rendered through React JSX |

## CSRF (Cross-Site Request Forgery)

| Check | Status | Notes |
|-------|--------|-------|
| Next.js CSRF protection | ✅ | Server Actions use POST with automatic CSRF tokens |
| Paymob webhook HMAC | ✅ | Webhook verified with SHA-512 HMAC + `timingSafeEqual` |
| Paymob redirect HMAC | ✅ | Redirect callback verified with HMAC |

## SQL Injection

| Check | Status | Notes |
|-------|--------|-------|
| Prisma parameterized queries | ✅ | All queries use Prisma client (parameterized) |
| Raw SQL usage | ⚠️ | `logDatabaseInfo()` uses `$queryRawUnsafe` but with no user input |

## API Security

| Endpoint | Auth Required | Validation | Rate Limited |
|----------|--------------|------------|-------------|
| `POST /api/webhooks/paymob` | HMAC verified | ✅ | ❌ |
| `GET /api/user/role` | ❌ | Email param required | ❌ |
| `GET /api/orders/[id]/payment-status` | ❌ | ID param required | ❌ |
| `GET /auth/callback` | Code exchange | ✅ | ❌ |
| Server Actions | ❌ | Partial | ❌ |

## Validation

| Location | Method | Coverage |
|----------|--------|---------|
| Auth forms | Zod schemas (`types/auth.ts`) | Login (email + password), Register (name + email + password + confirm) |
| Checkout form | Client-side `required` + `isValid` check | All required fields must be non-empty |
| Admin product form | None | No validation on create/update |
| Order creation | None | No server-side validation of input |
| Server action inputs | None | No Zod validation on server action parameters |

## Data Exposure

| Check | Status | Notes |
|-------|--------|-------|
| Supabase service role key | ⚠️ | In `.env` which is gitignored but exists in repo |
| Paymob secret key | ⚠️ | In `.env` which is gitignored but exists in repo |
| Database credentials | ⚠️ | In `.env` which is gitignored but exists in repo |
| Error messages | ⚠️ | Some server errors expose internal details (e.g., Prisma error messages) |
| Console logging | ⚠️ | Extensive `console.log` in `actions/orders.ts` may leak data in production |

## Specific Vulnerabilities

### 1. Server Actions Have No Auth Checks
```typescript
// Any unauthenticated user can call these:
createOrder(input)        // Creates orders
createCardOrder(input)    // Creates orders + triggers Paymob
getOrders()               // Fetches all orders (admin action)
getProducts()             // Fetches all products
updateOrderStatus(id, s)  // Updates order status
deleteProduct(id)         // Deletes products
```

### 2. Admin Role Check is Client-Side Only
The middleware (`proxy.ts`) only checks if a session exists, not if the user is ADMIN. A user could potentially:
1. Access `/admin` (middleware allows authenticated users)
2. The admin layout checks role client-side and redirects
3. But the page HTML/JS is still served

### 3. Guest User ID Predictability
```typescript
supabaseId: `guest_${input.email}_${Date.now()}`
```
Predictable format — could lead to ID collisions or targeted attacks.

### 4. No Input Sanitization
User-submitted fields (name, email, address, notes) are stored directly without sanitization.

## Recommendations

| Priority | Issue | Fix |
|----------|-------|-----|
| **Critical** | Server actions lack auth checks | Add auth verification to all admin server actions |
| **High** | Admin role check is client-side only | Add role check in middleware or server component |
| **High** | No rate limiting | Add rate limiting to auth endpoints and order creation |
| **High** | `.env` may be committed | Verify `.env` is in `.gitignore` and not in git history |
| **Medium** | No server-side input validation | Add Zod validation to all server actions |
| **Medium** | Extensive console.log in production | Remove or guard debug logging |
| **Medium** | No CSRF on API routes | Add auth checks to unprotected API routes |
| **Low** | Password complexity | Add uppercase, number, and special character requirements |
| **Low** | Guest user ID predictability | Use UUID or add randomness |
