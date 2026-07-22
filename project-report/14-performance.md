# 14 — Performance Review

## Bundle Analysis

### Key Dependencies by Size Impact

| Package | Size (approx.) | Loaded On | Notes |
|---------|----------------|-----------|-------|
| `next` | ~90KB (framework) | Every page | Required |
| `react` + `react-dom` | ~45KB | Every page | Required |
| `framer-motion` | ~120KB (gzipped) | Every page | Heavy — all components use it |
| `leaflet` | ~40KB | Checkout only | Dynamically imported (good) |
| `react-leaflet` | ~15KB | Checkout only | Dynamically imported (good) |
| `@supabase/supabase-js` | ~60KB | Auth pages + Navbar | Loaded on client |
| `zod` | ~15KB | Auth forms only | Tree-shakeable |
| `lucide-react` | Tree-shaken | Various | Individual icons imported |

### Dynamic Imports

| Module | Import Method | Location |
|--------|--------------|----------|
| `LocationPickerMap` | `next/dynamic` with `{ ssr: false }` | `components/checkout/LocationPicker.tsx` |
| `@/lib/paymob` | `await import()` (runtime) | `actions/orders.ts` |

### Code Splitting

- **Route-based splitting** — Next.js App Router automatically splits by route
- **No manual chunking** — No `next.config.ts` optimization for chunk splitting
- **No `loading.tsx` boundaries** — No route-level loading states (no automatic Suspense boundaries per route)

## Rendering Performance

### Server Components (Optimal)
- Homepage, Products listing, Product detail — data fetched on server, HTML sent to client
- No unnecessary client-side JavaScript for initial render of these pages

### Client Components (Potential Issues)
- All admin pages are fully client-rendered with `useEffect` data fetching
- Checkout is fully client-rendered (form state requires it)
- Auth pages are fully client-rendered
- **No `React.memo()`** used anywhere in the codebase

## Image Optimization

| Image | Location | Optimized? |
|-------|----------|-----------|
| Product images | `/public/images/products/` | **No** — raw JPEG/PNG files, served as-is via `<img>` tags |
| Hero image | `/public/images/proffee-hero-coffee.jpg` | **No** — raw JPEG, `<img>` tag |
| About image | `/public/images/proffee-gold-about.jpeg` | **No** — raw JPEG, `<img>` tag |

**No `next/image` usage** — All images use plain `<img>` tags despite Next.js Image component being available. This means:
- No automatic WebP conversion
- No responsive srcset
- No lazy loading (native browser only)
- No blur placeholder
- No size optimization

## Performance Bottlenecks

### High Impact

1. **`framer-motion` on every page** — 120KB+ gzipped loaded on initial page load for ALL pages, even static ones like Terms, Privacy, Shipping
2. **No image optimization** — Raw JPEG/PNG files without `next/image` are served at full resolution
3. **No loading states** — No `loading.tsx` files means no instant feedback during server component data fetching
4. **No `React.memo()`** — Components re-render unnecessarily when parent state changes

### Medium Impact

5. **Admin pages load all data at once** — No pagination for products or orders
6. **Cart context re-renders** — Every cart operation re-renders all consumers (Navbar, Cart page, Checkout)
7. **No `useMemo`/`useCallback` in components** — Only used in cart context, not in page components
8. **Supabase client created on every Navbar render** — `createClient()` is called in `useEffect` but the client isn't cached

### Low Impact

9. **No font optimization** — Fonts loaded via Next.js font module (optimal), but no `font-display: swap` verification
10. **Tailwind CSS v4** — CSS-based config is slightly larger than v3 JS config but negligible
11. **No service worker** — No offline support or asset caching
12. **No prefetching** — No manual `<Link prefetch>` optimization

## What's Working Well

1. **Server components for product pages** — Fast initial load for the most important pages
2. **Dynamic import for Leaflet** — Map library only loaded when checkout opens the picker
3. **Tailwind CSS purging** — Only used CSS is shipped
4. **Prisma singleton** — Prevents connection pool exhaustion in development
5. **Static pages** — Terms, Privacy, Shipping, etc. are static and fast
6. **Next.js Turbopack** — Development builds are fast

## Recommendations Summary

| Issue | Effort | Impact |
|-------|--------|--------|
| Replace `<img>` with `next/image` | Low | High |
| Add `loading.tsx` to routes | Low | Medium |
| Lazy-load `framer-motion` | Medium | High |
| Add `React.memo()` to heavy components | Medium | Medium |
| Add pagination to admin | Medium | Medium |
| Memoize cart context consumers | Low | Medium |
| Add `Suspense` boundaries around data-fetching | Low | Medium |
