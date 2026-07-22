# 08 — Services

The project has **no `services/` directory**. Service-layer logic is distributed across `lib/` and `actions/`.

## Prisma Client (`lib/prisma.ts`)

| Property | Detail |
|----------|--------|
| **Type** | Singleton module |
| **Exports** | `prisma` (PrismaClient instance), `logDatabaseInfo()` |
| **Pattern** | Global singleton via `globalThis` to survive hot reload in development |
| **Query logging** | Enabled — logs query text, params, and duration to console |
| **Database info** | `logDatabaseInfo()` runs once: queries PostgreSQL version, max_connections, pool_mode via raw SQL |

## Supabase Client (`lib/supabase/client.ts`)

| Property | Detail |
|----------|--------|
| **Type** | Factory function |
| **Export** | `createClient()` |
| **Runtime** | Browser only (uses `createBrowserClient` from `@supabase/ssr`) |
| **Env vars** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Usage** | Navbar (auth state), Account page (user data), Checkout (session) |

## Supabase Middleware (`lib/supabase/middleware.ts`)

| Property | Detail |
|----------|--------|
| **Type** | Helper function |
| **Export** | `updateSession(request: NextRequest)` |
| **Runtime** | Edge/Middleware (creates server-side Supabase client with cookie management) |
| **Returns** | `{ response: NextResponse, user: User \| null }` |
| **Usage** | `proxy.ts` — refreshes session cookies and extracts current user |

## Paymob Integration (`lib/paymob.ts`)

| Property | Detail |
|----------|--------|
| **Type** | Service module |
| **Exports** | `createPaymentIntention()`, `getCheckoutUrl()`, `verifyWebhookHMAC()`, `verifyRedirectHmac()` |
| **API** | Paymob Intention API v1 (`/v1/intention/`) |
| **Currency** | EGP (Egyptian Pound) |
| **Env vars** | `PAYMOB_SECRET_KEY`, `PAYMOB_INTEGRATION_ID`, `PAYMOB_HMAC_SECRET`, `PAYMOB_PUBLIC_KEY` |

### Functions

| Function | Input | Output | Description |
|----------|-------|--------|-------------|
| `createPaymentIntention()` | Amount (piasters), items, billing data, customer, notification/redirection URLs | `{ id, clientSecret, intentionOrderId }` | Creates a Paymob payment intention |
| `getCheckoutUrl()` | Client secret | `string` (URL) | Builds Paymob unified checkout URL |
| `verifyWebhookHMAC()` | Transaction object, received HMAC | `boolean` | SHA-512 HMAC verification for webhooks (20 fields) |
| `verifyRedirectHmac()` | Redirect params, received HMAC | `boolean` | SHA-512 HMAC verification for redirect callbacks |

### Security Features

- Uses `crypto.timingSafeEqual()` for constant-time HMAC comparison
- Detects legacy API key format and throws informative error
- Validates all required Paymob fields are present

## Product Queries (`lib/db-products.ts`)

| Property | Detail |
|----------|--------|
| **Type** | Data access layer |
| **Exports** | `getProductBySlug()`, `getProducts()`, `getFeaturedProducts()`, `getRoastLevels()`, `FeaturedProduct` type |
| **Runtime** | Server only (uses Prisma) |

### Functions

| Function | Query | Description |
|----------|-------|-------------|
| `getProductBySlug(slug)` | `prisma.product.findUnique({ where: { slug } })` | Single product by slug |
| `getProducts()` | `prisma.product.findMany({ orderBy: { createdAt: "desc" } })` | All products, newest first |
| `getFeaturedProducts()` | `prisma.product.findMany({ where: { featured: true } })` | Featured products for homepage |
| `getRoastLevels()` | `prisma.product.findMany({ select: { roastLevel: true }, distinct: [roastLevel] })` | Distinct roast levels, sorted by predefined order |

## Server Actions (`actions/`)

### `actions/auth.ts`
| Export | Purpose |
|--------|---------|
| `createUserInDB()` | Upserts user in Prisma by `supabaseId` |
| `getPrismaUserId()` | Resolves Supabase UUID → Prisma CUID |

### `actions/cart.ts`
| Export | Purpose |
|--------|---------|
| `getServerCart(userId)` | Fetches all cart items with product data and resolved prices |
| `addServerCartItem(userId, productId, quantity, weight)` | Adds item or increments quantity if exists |
| `removeServerCartItem(id)` | Deletes a cart item |
| `updateServerCartItemQuantity(id, quantity)` | Sets item quantity |
| `mergeServerCart(userId, items)` | Merges localStorage cart items into server cart |
| `clearServerCart(userId)` | Deletes all cart items for user |

### `actions/orders.ts`
| Export | Purpose |
|--------|---------|
| `createOrder()` | COD order creation (user upsert + order in transaction) |
| `createCardOrder()` | Card order creation + Paymob intention + extensive logging |
| `handlePaymentRedirect()` | Processes Paymob redirect callback with HMAC verification |

### `actions/admin.ts`
| Export | Purpose |
|--------|---------|
| `getStats()` | Dashboard metrics (orders, revenue, customers, products) |
| `getOrders()` | All orders with user and product details |
| `updateOrderStatus()` | Change order status with validation |
| `getProducts()` | All products |
| `createProduct()` | Create product |
| `updateProduct()` | Update product |
| `deleteProduct()` | Delete product |

## Observations

1. **No external HTTP client** — All API calls use native `fetch` (Paymob) or Prisma (database). No Axios instance exists.
2. **No caching layer** — No Redis, no Next.js cache, no `unstable_cache`. Product queries run on every request.
3. **No email service** — Newsletter signup is simulated. No transactional emails (order confirmation, password reset) are actually sent.
4. **No image upload service** — The admin product form has an image upload UI, but the actual storage integration (Supabase Storage) is only partially set up (`scripts/setup-storage.sql` exists but is not wired into the upload flow).
