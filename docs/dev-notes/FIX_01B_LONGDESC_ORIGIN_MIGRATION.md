# FIX-01B: Add `longDescription` and `origin` DB Columns

## Schema Changes

Two nullable columns added to `Product` model in `prisma/schema.prisma`:

```prisma
longDescription String?
origin          String?
```

Both are `String?` (optional, nullable) — existing rows default to `NULL` without breaking.

## Migration

**Migration name:** `add_product_long_description_and_origin`

**File:** `prisma/migrations/20260702_add_product_long_description_and_origin/migration.sql`

```sql
ALTER TABLE "Product" ADD COLUMN "longDescription" TEXT,
ADD COLUMN "origin" TEXT;
```

> **Note:** The Supabase DB was unreachable from this sandbox environment, so `prisma migrate dev` could not apply directly. Run `npx prisma migrate dev` on a machine with DB access — it will detect the existing migration directory and apply it.

## Files Touched

| File | Change |
|---|---|
| `prisma/schema.prisma` | Added `longDescription String?` and `origin String?` to Product model |
| `prisma/migrations/20260702_add_product_long_description_and_origin/migration.sql` | Created migration SQL |
| `lib/db-products.ts` | Removed `originMap` and `originFromName()` entirely. Both `getProductBySlug` and `getProducts` now read `p.longDescription` / `p.origin` from the DB directly. **Fallback:** if `longDescription` is null → uses `p.description`; if `origin` is null → uses `""` |
| `actions/admin.ts` | Added `longDescription?: string` and `origin?: string` to `ProductInput` type. Both `createProduct` and `updateProduct` pass `input.longDescription ?? null` / `input.origin ?? null` to Prisma |
| `app/admin/products/page.tsx` | Added textarea for `longDescription` (optional, 4 rows) and text input for `origin` (optional) in the admin form. Updated local `Product` type and `openEdit` to handle these fields |
| `prisma/seed.ts` | Added the original `longDescription` and `origin` values (copied from the now-removed static `lib/products.ts` array) to all 8 seed products. Uses `prisma.product.upsert` by slug, so re-running the seed will backfill existing DB rows without creating duplicates |

## Backfill Strategy

The seed script uses `prisma.product.upsert` keyed on `slug`. Running:

```bash
npx prisma db seed
```

will update existing products in-place with the new `longDescription` and `origin` values. If the DB already has the 8 seeded products, the upsert updates only the new columns.

**Important:** Run both the migration and the seed after applying:

```bash
npx prisma migrate dev       # applies the SQL
npx prisma db seed            # backfills longDescription + origin for existing products
```

## End-to-End Roundtrip Verification

1. **Detail page** (`app/(public)/products/[slug]/page.client.tsx`): renders `product.longDescription` (line 76) and `product.origin` (lines 69, 82) — both now come from real DB columns
2. **Admin create form**: Admin fills in `longDescription` + `origin` → `createProduct` writes to Prisma → detail page reads them back from the DB
3. **Admin edit form**: `openEdit` populates `longDescription` + `origin` from the DB → admin can modify → `updateProduct` persists changes
4. **Null safety**: If `longDescription` is null in DB, `db-products.ts` falls back to `description`. If `origin` is null, falls back to `""`
5. **TypeScript**: `npx tsc --noEmit` passes with zero errors

## Cleanup

The `originMap` and `originFromName()` functions in `lib/db-products.ts` are now fully removed — origin is no longer derived via name-guessing.
