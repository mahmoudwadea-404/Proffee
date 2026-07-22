# 10 — Authentication

## Overview

| Property | Detail |
|----------|--------|
| **Provider** | Supabase Auth |
| **Method** | Email/password authentication |
| **Session type** | Cookie-based (managed by `@supabase/ssr`) |
| **User storage** | Supabase Auth (UUID) + Prisma User (CUID) |
| **Role system** | CUSTOMER / ADMIN (Prisma enum) |

## Login Flow

```
1. User navigates to /login
2. User enters email + password
3. Client calls supabase.auth.signInWithPassword({ email, password })
4. Supabase returns session (access_token + refresh_token)
5. Session cookies are set by @supabase/ssr
6. Navbar detects auth state change via supabase.auth.onAuthStateChange
7. Navbar fetches GET /api/user/role?email={email}
8. If role === "ADMIN", admin panel link appears in nav
```

**File:** `app/(auth)/login/page.client.tsx`

## Signup Flow

```
1. User navigates to /register
2. User enters name, email, password, confirm password
3. Client calls supabase.auth.signUp({
     email, password,
     options: { emailRedirectTo: `${origin}/auth/callback?name=${name}` }
   })
4. Supabase sends verification email
5. User clicks email link → /auth/callback?code=...&name=...
6. /auth/callback exchanges code for session
7. /auth/callback creates Prisma User record (if new)
8. User is redirected to "/" with active session
```

**Files:** `app/(auth)/register/page.client.tsx`, `app/auth/callback/route.ts`

## OAuth Callback (`/auth/callback`)

```typescript
// app/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const code = searchParams.get("code")
  const name = searchParams.get("name") || "User"

  // Exchange code for Supabase session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (!error && data.user) {
    // Upsert user in Prisma database
    const existing = await prisma.user.findUnique({ where: { supabaseId: data.user.id } })
    if (!existing) {
      await prisma.user.create({
        data: { supabaseId: data.user.id, name, email: data.user.email! }
      })
    }
  }
}
```

## Session Management

- **Cookie-based**: `@supabase/ssr` manages session tokens in HTTP-only cookies
- **Refresh**: `lib/supabase/middleware.ts` creates a server client that automatically refreshes sessions
- **Detection**: `supabase.auth.onAuthStateChange()` in `Navbar.tsx` listens for auth state changes
- **User object**: Supabase `User` type is stored in Navbar component state

## Route Protection

### Middleware (`proxy.ts`)

```typescript
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)

  // /account/* → redirect to /login if no session
  if (!user && request.nextUrl.pathname.startsWith("/account")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // /admin/* → redirect to /login if no session
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"]
}
```

### Admin Role Check (Component Level)

```typescript
// app/admin/layout.tsx
useEffect(() => {
  const user = await supabase.auth.getUser()
  if (!user) { redirect("/login"); return }

  const res = await fetch(`/api/user/role?email=${user.email}`)
  const { role } = await res.json()

  if (role !== "ADMIN") { redirect("/"); return }

  setIsAuthorized(true)
}, [])
```

**Note:** Admin role check is done at the component level, not in middleware, to avoid Prisma Edge runtime conflicts (Prisma cannot run in Edge runtime which middleware uses).

### Account Page Protection

```typescript
// app/account/page.client.tsx
useEffect(() => {
  const user = await supabase.auth.getUser()
  if (!user) { router.push("/login"); return }
  // ... load account data
}, [])
```

## Roles and Permissions

| Role | Access | Check Location |
|------|--------|---------------|
| `CUSTOMER` | All public pages, account pages | Default role on registration |
| `ADMIN` | All public + admin pages | `proxy.ts` (auth) + `admin/layout.tsx` (role) |

**No granular permissions** — binary ADMIN/CUSTOMER split only.

## Guest Checkout

Guest users (not logged in) can place orders:

1. Checkout form collects email, name, phone, address
2. `createOrder()` / `createCardOrder()` upserts a User with `supabaseId: "guest_{email}_{timestamp}"`
3. Order is linked to the guest user record
4. Guest user has `role: CUSTOMER` and can be converted to a real user on registration

## Token / Secret Handling

| Secret | Location | Exposed to Client? |
|--------|----------|-------------------|
| `DATABASE_URL` | `.env` | No (server only) |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env` | No (server only) |
| `PAYMOB_SECRET_KEY` | `.env` | No (server only) |
| `PAYMOB_HMAC_SECRET` | `.env` | No (server only) |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env` | Yes (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env` | Yes (public) |
| `PAYMOB_PUBLIC_KEY` | `.env` | No (only used in server-side `getCheckoutUrl`) |

## Observations

1. **No `loading.tsx`** for auth pages — no loading state during session checks
2. **No rate limiting** on login/register endpoints
3. **No CSRF protection** beyond Supabase's built-in token handling
4. **Guest user supabaseId is predictable** (`guest_{email}_{timestamp}`) — could lead to collisions if two guests register with the same email in the same millisecond
5. **No email verification enforcement** — Supabase sends verification emails but the app doesn't check `user.email_confirmed_at`
6. **Admin role check is client-side only** — The middleware only checks auth, not role. A malicious user could potentially access admin page HTML (though the layout redirects before data loads)
7. **No password complexity requirements** beyond minimum 6 characters (Zod schema)
