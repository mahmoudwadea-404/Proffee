# FIX-01: Product Data Source Unification

## Problem

Two sources of product data existed:
- `lib/products.ts` — static hardcoded array of 8 products (used by detail page)
- `lib/db-products.ts` — Prisma DB queries (used by listing page)

Admin-created/edited products appeared in the listing but failed on the detail page (or showed stale static data).

## Files Changed

| File | Change |
|---|---|
| `lib/db-products.ts` | Added `getProductBySlug(slug)` — queries Prisma by unique slug, returns `Product \| null` |
| `app/(public)/products/[slug]/page.tsx` | Rewired to use Prisma-based `getProductBySlug`; fetches product + related products server-side; calls `notFound()` if missing |
| `app/(public)/products/[slug]/page.client.tsx` | Now receives `product` and `related` as props from server component; removed `useParams` and client-side static array fetch |
| `lib/products.ts` | Removed static `products` array (695 bytes), `coffeeImages`, `getProductBySlug`, `filterProducts`. Kept `Product` interface and `roastLevels` |


## Field Mapping / Alignment Notes

The `Product` interface is unchanged. `db-products.ts` maps Prisma rows to it as follows:

| `Product` field | Prisma column | Mapping | Notes |
|---|---|---|---|
| `id` | `id` | direct | |
| `name` | `name` | direct | |
| `slug` | `slug` | direct | (unique) |
| `description` | `description` | direct | |
| `longDescription` | *(none)* | `description` | **Not a separate DB column** — admin-created products will have `longDescription === description`. To support separate expanded descriptions, add a `longDescription` column to the Prisma schema and a migration. |
| `price` | `price` | direct | |
| `image` | `imageUrl` | `p.imageUrl` | Field renamed in mapping |
| `roastLevel` | `roastLevel` (String) | cast via `as Product["roastLevel"]` | Prisma stores as plain string; cast to union type |
| `flavorNotes` | `flavorNotes` (String[]) | direct | |
| `weightOptions` | `weightOptions` (Json) | cast via `as Product["weightOptions"]` | Stored/retrieved as JSON array |
| `origin` | *(none)* | `originFromName(name)` | **Not stored in DB** — derived via hardcoded name map. New products whose name doesn't match the map will fall back to `name.split(" ")[0]`. |
| `featured` | `featured` (Boolean) | direct | |

## Deleted from `lib/products.ts`

- `const products: Product[]` — static 8-item array (no longer referenced anywhere)
- `const coffeeImages` — only used by the static array
- `getProductBySlug(slug)` — moved to `db-products.ts`
- `filterProducts(params)` — unused in all source files (only existed in `.next/` build cache)

## Retained in `lib/products.ts`

- `Product` interface — still imported by `db-products.ts`, `page.client.tsx` (listing), and `page.client.tsx` (detail)
- `roastLevels` — still imported by `app/admin/products/page.tsx` for the roast-level `<select>` dropdown

## `roastLevels` Approach

**Chose to keep the static list** in `lib/products.ts` rather than querying distinct DB values. The admin form needs the full canonical set of valid roast levels to offer as options — not just the ones that happen to exist in the database. The product listing page already uses `getRoastLevels()` from `db-products.ts` (distinct Prisma query), which is correct for the filter UI.

## Remaining Risk / Follow-Up

1. **`longDescription` missing from Prisma schema** — Admin-created products will display the same short and long description. To fix: add `longDescription String?` to `prisma/schema.prisma`, run a migration, and update the admin form + `db-products.ts` mapping.

2. **`origin` not stored in DB** — Derived via heuristic. Admin-created products in a new origin (e.g., "Rwanda") will fall back to the first word of the name. To fix: add a required `origin` column to the Prisma schema, update admin form, and `db-products.ts`.

3. **`stock` and `images`** exist in the Prisma schema but are not exposed in the `Product` interface. If the frontend later needs to show stock levels or multiple images, update the interface and mapping.

## Verification

- `npx tsc --noEmit` passes with zero errors
- Both listing and detail pages now pull from the same Prisma source
- Admin-created products will now resolve correctly on their detail page (via `getProductBySlug` → Prisma `findUnique`)
- Admin CRUD flow (`actions/admin.ts`) is untouched
