# Fix: Migration Shadow Database / Schema Sync Issue

## Problem

The project had no Prisma migration history — all tables (Product, User, Order, etc.) were created via `prisma db push`, never via `prisma migrate`. When a migration SQL file was manually placed in `prisma/migrations/`, Prisma tried to build a shadow database from scratch using migration history, found no baseline migration, and failed with:

```
P3006 — Migration failed to apply cleanly to the shadow database
P1014 — The underlying table for model `Product` does not exist
```

Additionally, the `longDescription` and `origin` columns from the previous FIX-01B work existed in `schema.prisma` but had never been synced to the live database, and the seed data for those columns had never been populated.

## What Was Done

1. **Removed `prisma/migrations/` directory entirely** — no broken migration history remains to confuse Prisma.

2. **Confirmed schema sync** via `npx prisma db push`:
   ```
   The database is already in sync with the Prisma schema.
   ```
   The `longDescription` and `origin` columns were already present in the database (schema was already live from prior work).

3. **Ran seed** via `npx prisma db seed`:
   ```
   ✓ Ethiopia Yirgacheffe
   ✓ Colombia Supreme
   ✓ Kenya AA
   ✓ Sumatra Mandheling
   ✓ Guatemala Antigua
   ✓ Costa Rica Tarrazú
   ✓ Brazil Santos
   ✓ Ethiopia Guji
   ```

4. **Verified data** — queried all 8 products; every row has a real `origin` (e.g. `Ethiopia`, `Colombia`) and a populated `longDescription` (not null).

5. **Generated Prisma Client** — `prisma generate` completed successfully.

6. **TypeScript check** — `npx tsc --noEmit` passes with zero errors.

## Current State

| Artifact | Status |
|---|---|
| `prisma/migrations/` | **Deleted entirely** — project is not using Prisma Migrate |
| `prisma/schema.prisma` | Includes `longDescription String?` and `origin String?` on Product model |
| Database schema | In sync with `schema.prisma` (managed via `db push`) |
| Seed data | All 8 products have real `origin` and `longDescription` values |

## Approach Chosen

**Deleted `prisma/migrations/` entirely** and continue using `prisma db push` for schema syncing. Rationale:

- The project is in active development with no production user data.
- Creating a retroactive baseline migration would add unnecessary complexity for zero benefit at this stage.
- `db push` is the right tool for pre-production / schema-prototyping phases.
- When the project reaches production-readiness, a one-time `prisma migrate diff --from-empty --to-schema-datamodel ... --script` can generate a single baseline migration, then `prisma migrate resolve --applied "baseline"` can mark it without re-applying.

## Verification

Both columns now round-trip correctly: admin form → `createProduct`/`updateProduct` → PostgreSQL → `getProductBySlug` / `getProducts` → detail page.
