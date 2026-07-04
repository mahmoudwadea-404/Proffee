-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- Creates the product-images bucket with:
--   Public read (anyone can view product images)
--   Admin-only upload/update/delete (checks role in public."User" table)

-- 1. Helper function: checks if the authenticated user is an admin
--    The User table is managed by Prisma and stores admin role.
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."User"
    WHERE "supabaseId" = auth.uid()::text
    AND "role" = 'ADMIN'
  );
$$;

-- 2. Create the bucket (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Public read (unauthenticated users can view product images)
CREATE POLICY "product_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- 4. Admin-only upload
CREATE POLICY "product_images_admin_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND public.is_admin_user()
);

-- 5. Admin-only update
CREATE POLICY "product_images_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND public.is_admin_user()
)
WITH CHECK (
  bucket_id = 'product-images'
  AND public.is_admin_user()
);

-- 6. Admin-only delete
CREATE POLICY "product_images_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND public.is_admin_user()
);
