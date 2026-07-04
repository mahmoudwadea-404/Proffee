# FIX-02: Supabase Session Refresh Middleware / Proxy

## What Was Missing / Wrong

Two things were needed:

1. **`lib/supabase/middleware.ts` did not exist** — This is the standard `@supabase/ssr` companion module that creates a request-scoped Supabase server client and calls `getUser()` to refresh the session cookie on every request. Without it, there was no reusable utility to handle cookie-based session refresh outside of route handlers and server components.

2. **Next.js 16 has deprecated `middleware.ts` in favor of `proxy.ts`** — The root-level file must be named `proxy.ts` and export a named `proxy` function. A root `middleware.ts` file causes a runtime error in Next.js 16.2+.

## What Was Done

### Created: `lib/supabase/middleware.ts`

A reusable `updateSession(request: NextRequest)` function that:
- Creates a `createServerClient` from `@supabase/ssr` using the request cookies (`getAll`/`setAll` pattern — the current API, not the deprecated per-cookie methods)
- Calls `supabase.auth.getUser()` (not `getSession()`) to revalidate the session server-side
- Returns `{ response: NextResponse, user }` so callers can inspect the user for route protection without re-creating the client

This file is the single place where the request-scoped Supabase client and cookie propagation logic lives, aligned with the cookie pattern already used in `lib/supabase/server.ts`.

### Refactored: `proxy.ts` (already existed)

The file already existed but had the Supabase client creation inlined. It was refactored to:
- Import and call `updateSession` from `lib/supabase/middleware.ts`
- Use the returned `user` for route protection
- Keep its existing route protection logic (see below)

### Deleted: `middleware.ts` (root-level, created by mistake)

I initially created a root `middleware.ts` before realizing Next.js 16 uses `proxy.ts`. It was deleted — zero trace left.

## Cookie Handling Pattern

```
proxy.ts                              lib/supabase/middleware.ts
  │                                         │
  │  calls updateSession(request) ─────────→│  createServerClient({ getAll, setAll })
  │                                         │  supabase.auth.getUser()
  │  ←── { response, user } ───────────────│  returns { response, user }
  │                                         │
  │  route protection using user            │
  │  returns response with refreshed cookies│
```

- `getAll()` — reads existing auth cookies from the incoming request
- `setAll()` — writes refreshed cookies to the outgoing response (and to the request object so subsequent operations see them)
- Uses `getUser()` — makes an HTTP request to Supabase Auth to verify/refresh the session, unlike `getSession()` which only reads the local token

## Route Protection

The `proxy.ts` file protects two path groups at the proxy level:

| Path | Behavior |
|---|---|
| `/account/*` | Redirects unauthenticated users to `/login` |
| `/admin/*` | Redirects unauthenticated users to `/login` (role-based ADMIN check remains in `app/admin/layout.tsx` at the component level, as noted in the existing code comment) |

**Why route protection was KEPT at the proxy level:** The existing code already had this, and removing it would be a regression. The `/account` and `/admin` routes need auth-gating before they render — catching unauthenticated requests early in the proxy is more secure and avoids unnecessary server component rendering.

**Why we did NOT add broader route protection:** The existing client-side flows in `Navbar.tsx` and `admin/layout.tsx` handle their own auth state. Adding proxy-level redirects for all routes would conflict with the existing client-side redirect logic and could break flows like the public product listing and detail pages (which should remain accessible without auth).

## Remaining Risk / Follow-Up

- **`proxy.ts` runs on Node.js runtime by default** in Next.js 16 (changed from Edge Runtime in prior versions). This means `updateSession` runs on Node.js, not Edge. If Edge deployment is desired later, ensure the `createServerClient` call is compatible.

- **Client-side auth listener** in `Navbar.tsx` uses `supabase.auth.getSession()` (not `getUser()`). This is the standard client-side pattern — the proxy refreshes the cookie, and the client reads the refreshed cookie. No change needed.

- **`app/auth/callback/route.ts`** creates its own Supabase client (not using `updateSession`). This is correct — the OAuth callback needs to exchange the code for a session, which `updateSession` doesn't do.

## Verification

- `npx tsc --noEmit` passes with zero errors in project source files
- `proxy.ts` matcher restricts execution to `/account/:path*` and `/admin/:path*`
- `updateSession` returns `{ response, user }` for use by route protection logic
- Session cookies are refreshed on every `/account` and `/admin` request via `getUser()`
