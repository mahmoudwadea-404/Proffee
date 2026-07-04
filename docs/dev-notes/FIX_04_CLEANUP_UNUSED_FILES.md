# FIX-04: Cleanup Unused Files

## Files Deleted

### 1. `components/home/FeaturedProducts.tsx`
- **Search performed:** Grep for `FeaturedProducts` across all `*.{ts,tsx,js,jsx}` files in `app/`, `components/`, `lib/`.
- **Result:** Only the file's own definition matched. The home page (`app/(public)/page.tsx`) imports `{ getFeaturedProducts }` from `@/lib/db-products` — a **Prisma DB function**, not the component. All other matches are `.next/` build artifacts.
- **Content:** Hardcoded Arabic-language component with static product data (Ethiopia Yirgacheffe, Colombia Supreme, Kenya AA) referencing broken local image paths (`/images/coffee-1.jpg` etc. that don't exist in `public/`).

### 2. `components/pixel-perfect-hero.tsx`
- **Search performed:** Grep for `PixelHero` and `pixel-perfect-hero` across all `*.{ts,tsx,js,jsx}` files in the entire project (excluding `.next/`).
- **Result:** Only the file's own definition matched. All other matches are `.next/` build artifacts.
- **Content:** Standalone canvas-based particle animation "PixelHero" component with a dark `#0A0A0A` theme, metallic gold accents, and designer-portfolio-style CTAs ("Explore Design", "View GitHub") — clearly a showcase piece, not wired into any page.

## Files Flagged (Not Deleted)

| File | Reason |
|---|---|
| `lib/utils.ts` | Exports `cn()` (clsx + twMerge wrapper). Only used by the now-deleted `pixel-perfect-hero.tsx`. Orphaned but retained as a conventional utility expected in most Next.js projects. Review if development is ongoing. |

All other files in `components/` and `lib/` are confirmed to be actively imported in source code.

## Verification

- `npx tsc --noEmit`: exit code **0** (zero type errors)
- `npm run build`: **Compiled successfully** (4.8s, 25/25 pages generated)
- All routes pass: `/`, `/about`, `/products`, `/cart`, `/checkout`, `/faqs`, `/shipping`, `/returns`, `/terms`, `/privacy`, etc.
- Proxy (middleware) builds successfully.
