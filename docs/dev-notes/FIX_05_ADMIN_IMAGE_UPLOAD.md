# FIX-05: Admin Product Image Upload via Supabase Storage

## Storage Bucket

- **Name:** `product-images`
- **Type:** Public (readable by anyone)
- **Policies:**
  - `product_images_public_read` — any user (public) can SELECT/view images
  - `product_images_authenticated_upload` — authenticated users can INSERT/upload
  - `product_images_authenticated_update` — authenticated users can UPDATE
  - `product_images_authenticated_delete` — authenticated users can DELETE

## Files Changed

### New files
| File | Purpose |
|---|---|
| `lib/supabase/service.ts` | Singleton Supabase admin client using `SUPABASE_SERVICE_ROLE_KEY`. Reuses the global singleton pattern from `lib/prisma.ts`. |
| `scripts/setup-storage.sql` | SQL script to create the bucket and RLS policies in Supabase. |

### Modified files
| File | Change |
|---|---|
| `actions/admin.ts` | Added `uploadProductImage(formData)` server action: validates file type (JPG/PNG/WebP) and size (max 5MB), uploads via service role client to `product-images` bucket with a unique timestamp+random filename, returns the public URL. Added `serviceClient` import. |
| `app/admin/products/page.tsx` | Added file input with drag-to-upload area (32x32 dashed border box), image preview thumbnail, upload spinner/loading state, error display. Kept the existing text URL input as a fallback ("Or paste image URL"). On successful upload, auto-populates the URL field with the Supabase Storage public URL. |

## Manual Steps Required

### 1. Run the SQL in Supabase Dashboard
Open Supabase Dashboard → SQL Editor → paste `scripts/setup-storage.sql` → Run.

### 2. Verify env variables
The `.env` file already contains:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅

No changes to `.env` are needed.

## Upload → Save Flow

1. Admin opens Add/Edit Product modal in `/admin/products`
2. Clicks the dashed upload box → selects a `.jpg`, `.png`, or `.webp` file (≤5MB)
3. Upload progress spinner appears; on success, preview thumbnail renders + URL text field auto-populates with the Supabase Storage public URL (e.g. `https://jatftwobdafpeutegpnc.supabase.co/storage/v1/object/public/product-images/product-1234567890-abc123.jpg`)
4. If validation fails (wrong type or oversized), a red error message appears; the URL field is not changed
5. Admin can still manually paste/edit the URL text field as before
6. Admin clicks "Create Product" or "Update Product" — the existing `createProduct`/`updateProduct` actions save the URL unchanged (no modifications needed to those actions)
7. The product listing and detail pages render the image from the stored URL (they already use `imageUrl` from the DB)

## Verification

- `npx tsc --noEmit`: exit code **0**
- No changes needed to `createProduct`/`updateProduct` — they already accept `imageUrl: string` and store it as-is
