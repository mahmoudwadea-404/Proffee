# FIX-05B: Direct Browser-to-Supabase Upload (Remove Server Action)

## What Changed & Why

**Problem:** The previous `uploadProductImage()` server action routed file bytes through Next.js, hitting the 1MB Server Action body size limit for real product photos.

**Solution:** Upload files directly from the browser to Supabase Storage using the browser Supabase client (`@/lib/supabase/client`). File bytes never pass through the Next.js server — no body size limit applies. Supabase Storage accepts files up to its plan limit (default 50MB on free tier, well above our 5MB client cap).

## Files Changed

| File | Change |
|---|---|
| `actions/admin.ts` | **Removed** `uploadProductImage()` server action and the `serviceClient` import — no longer needed since upload is client-side. |
| `lib/supabase/service.ts` | **Deleted** — orphaned after the server action removal. Was the only file that imported it. |
| `app/admin/products/page.tsx` | **Rewrote `handleFileUpload`** — imports `createClient` from `@/lib/supabase/client`, uploads directly from the browser via `supabase.storage.from('product-images').upload()`, validates file type + size client-side before uploading, populates URL field on success. |
| `scripts/setup-storage.sql` | **Replaced** blanket `TO authenticated` policies with admin-role-gated policies using a `public.is_admin_user()` helper function that checks the Prisma `"User"` table (matches `auth.uid()` against `"supabaseId"` and checks `"role" = 'ADMIN'`). |

## Upload Flow

1. Admin opens form → clicks upload box → selects image (≤5MB, JPG/PNG/WebP)
2. Client-side validation runs first (file type + size) — fails fast without a network call
3. Supabase browser client uploads directly to `product-images` bucket
4. RLS policy: INSERT requires `authenticated` AND `public.is_admin_user()` → the function checks the Prisma `User` table for ADMIN role against the authenticated user's Supabase UID
5. On success, `getPublicUrl()` returns the public URL → auto-populates the image URL field
6. Admin clicks Update/Create → existing `createProduct`/`updateProduct` saves it unchanged

## Manual Step Required

Run `scripts/setup-storage.sql` in **Supabase SQL Editor** (Dashboard → SQL Editor → New Query → paste → Run). This will:

1. Create the `is_admin_user()` helper function
2. Create/update the `product-images` bucket (idempotent — safe to re-run)
3. Drop old policies and create new admin-role-gated policies

**Important:** This SQL needs to be run even if you already ran the previous version — the policies have changed from `TO authenticated` to `TO authenticated WITH CHECK (public.is_admin_user())`.

## Verification

- `npx tsc --noEmit`: exit code **0**
- No server action body size limit can be hit (file never touches Next.js server)
- Image URL text field still works as fallback for manual paste
