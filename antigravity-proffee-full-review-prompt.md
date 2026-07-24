# Antigravity Prompt — Full Project Audit & Iterative Fix Loop for "Proffee"

## Context (paste this section as-is so Antigravity understands the project)

Project name: **Proffee**
Type: Specialty coffee e-commerce platform
Stack: **Next.js, Prisma, Supabase, Tailwind CSS, deployed on Vercel**
Payment: **Paymob** (Intention API)
Auth model: Customer-facing signup/login has been removed — checkout is **guest-only**. Only the **Admin** has an authenticated account, used exclusively to access the admin dashboard (`/admin` or `/dashboard`).

You are acting as a senior full-stack code reviewer and fixer. Your job is not a one-pass read-through — it is an **iterative audit loop** that keeps going until the entire codebase is verified clean.

---

## Mission

Review the **entire Proffee codebase, file by file, line by line**. Find every bug, broken reference, security issue, performance problem, dead code path, inconsistency, and incomplete feature. Fix what you find. Then **start the review again from the beginning** and repeat the full cycle. Keep looping until a complete pass produces **zero new issues** — only then is the project considered "100% sound."

Do not stop after fixing the first batch of problems and assume the project is done. Assume each fix might introduce a new problem elsewhere (broken import, unused variable, type mismatch, etc.) — the next full pass exists specifically to catch that.

---

## Phase 0 — Setup (do this once, before Pass 1)

1. Map the full project structure (`app/`, `components/`, `lib/`, `prisma/`, `api/`, etc.). Produce a short inventory of every route, page, API endpoint, and shared component.
2. Confirm the project builds and runs locally right now (`npm install`, `npm run build`, `npm run dev`) before touching anything. Record any pre-existing build errors as your Pass 1 starting checklist.
3. Read `prisma/schema.prisma` fully and note every model and relation — this is your source of truth for data shape.
4. Note known recent changes so you don't reintroduce them:
   - Guest-only checkout: orders store customer info (name, phone, address, email) directly on the order record, NOT linked to a `User` foreign key.
   - Admin auth is the only authentication system left in the app; it must remain fully intact and protected, and has rate limiting on its login route (max ~5 attempts per IP per 15 minutes with lockout).
   - Do NOT delete or alter the `User`/`Customer` table or any existing order history tied to it — if you find such data, flag it, don't touch it, and ask before changing schema.

---

## Phase 1 — The Review Loop (repeat until a full pass finds nothing)

For **every pass**, go through the codebase in this order and check each category below. Treat this checklist as mandatory for every single pass, not just the first.

### A. Correctness & runtime errors
- Broken imports, missing exports, unused/undefined variables
- Type errors (if TypeScript) — no `any` used to silence real problems
- Null/undefined access without guards (especially on Prisma query results)
- React hydration mismatches (server vs client rendered output differing)
- Unhandled promise rejections, missing `try/catch` around async calls (DB, Paymob API, Supabase)
- Broken navigation links, 404s, dead routes left over from removed features (e.g. any leftover Track Order / Wishlist / customer-login references)

### B. Data layer (Prisma + Supabase)
- Every Prisma query matches the actual current schema
- No queries still assuming a `userId` relation on orders (guest checkout)
- Migrations are in sync with `schema.prisma` — no drift
- N+1 query patterns that should be a single query with `include`/`select`
- Proper indexes on frequently queried fields (e.g. order status, product slug)

### C. Payment (Paymob)
- Intention API calls use the **Secret Key**, not the legacy API Key
- Webhook/callback handling verifies the HMAC signature before trusting payment status
- Failed/pending/cancelled payment states are all handled, not just "success"
- No sensitive keys hardcoded — everything pulled from environment variables
- Order status in the DB only flips to "paid" after Paymob confirms, never optimistically before confirmation

### D. Guest checkout flow
- All required guest fields (name, phone, address, email) are validated server-side, not just client-side
- Phone/email format validation exists and gives clear error messages
- Cart persists correctly through the checkout steps without needing a logged-in session
- Order confirmation page/email works without a user account

### E. Admin dashboard & auth
- `requireAdminAuth` (or equivalent middleware) protects every admin route — check each one individually, don't assume a blanket middleware covers new routes added later
- Session handling is secure (proper cookie flags: httpOnly, secure, sameSite)
- Rate limiting on admin login is actually wired in and testable, not just present in code but unused
- No leftover customer auth code paths (`useSession`, `getUser`, customer `requireAuth`) still referenced anywhere

### F. Frontend / UI
- All Tailwind classes resolve (no typos silently doing nothing)
- Responsive behavior on mobile breakpoints for every page, not just desktop
- Images have proper `alt` text and use Next.js `<Image>` where applicable (not raw `<img>` unless intentional)
- Loading and error states exist for every data-fetching component (not just the happy path)
- Forms have proper validation feedback and disabled states while submitting (no double-submit bugs)

### G. API routes
- Every API route validates its input (don't trust the client)
- Proper HTTP status codes returned (400 vs 401 vs 404 vs 500 used correctly)
- No API route accidentally left open that should be admin-only
- Consistent error response shape across all routes

### H. Environment & config
- `.env.example` (or similar) lists every required environment variable with no real secrets committed
- No secrets committed anywhere in the repo history for files touched this pass
- `next.config.js`, `vercel.json` (if present) are consistent with actual deployment needs

### I. Dead code & cleanup
- Unused components, unused npm dependencies (check `package.json` against actual imports)
- Commented-out blocks of old code that should just be deleted
- Console.log/debug statements left in production code paths

### J. Performance
- Unnecessary client-side rendering where server components would do (Next.js App Router)
- Large unoptimized images
- Missing caching/revalidation strategy on product/catalog data that doesn't change often

---

## Phase 2 — After each pass

At the end of every pass, produce a short report with:
1. **Issues found this pass** (list, grouped by category A–J above)
2. **Issues fixed this pass**
3. **Anything flagged but NOT auto-fixed** (e.g. schema changes affecting existing user data) — explain why it needs human confirmation
4. Confirm `npm run build` still passes after the fixes

Then **immediately start the next pass from category A again.**

---

## Stopping condition

Stop looping only when an entire pass (categories A through J, full codebase) completes with:
- Zero new issues found
- `npm run build` passes cleanly
- No flagged items pending human decision

When that happens, give a final summary: total passes run, total issues fixed across all passes, and a final "project health" checklist confirming each category (A–J) is clean.

---

## Hard rules (do not violate, even to fix something)

- Never delete or alter the `User`/`Customer` table, its data, or any order history linked to it without explicit human confirmation first.
- Never touch Admin login logic's core behavior (only add rate limiting / security hardening, don't change how it fundamentally works) without flagging it first.
- Never commit or push to git automatically — leave changes staged locally unless explicitly told to commit/push.
- Never remove environment variable requirements without flagging them first.
