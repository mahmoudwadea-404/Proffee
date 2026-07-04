-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wishlist" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Product policies
-- ============================================================
-- Anyone can view products
CREATE POLICY "Products are viewable by everyone"
ON "Product" FOR SELECT
USING (true);

-- Only admins can insert/update/delete products
CREATE POLICY "Only admins can insert products"
ON "Product" FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'role' = 'ADMIN'
  OR auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE role = 'ADMIN')
);

CREATE POLICY "Only admins can update products"
ON "Product" FOR UPDATE
USING (
  auth.jwt() ->> 'role' = 'ADMIN'
  OR auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE role = 'ADMIN')
);

CREATE POLICY "Only admins can delete products"
ON "Product" FOR DELETE
USING (
  auth.jwt() ->> 'role' = 'ADMIN'
  OR auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE role = 'ADMIN')
);

-- ============================================================
-- User policies
-- ============================================================
-- Users can read their own data; admins can read all
CREATE POLICY "Users can view own profile"
ON "User" FOR SELECT
USING (
  auth.uid()::text = "supabaseId"
  OR auth.jwt() ->> 'role' = 'ADMIN'
);

-- Users can update their own data only
CREATE POLICY "Users can update own profile"
ON "User" FOR UPDATE
USING (auth.uid()::text = "supabaseId")
WITH CHECK (auth.uid()::text = "supabaseId");

-- ============================================================
-- CartItem policies
-- ============================================================
CREATE POLICY "Users can manage own cart items"
ON "CartItem" FOR ALL
USING (
  auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE id = "userId")
)
WITH CHECK (
  auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE id = "userId")
);

-- ============================================================
-- Order policies
-- ============================================================
CREATE POLICY "Users can view own orders"
ON "Order" FOR SELECT
USING (
  auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE id = "userId")
  OR auth.jwt() ->> 'role' = 'ADMIN'
);

CREATE POLICY "Users can create own orders"
ON "Order" FOR INSERT
WITH CHECK (
  auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE id = "userId")
);

-- Admins can update any order
CREATE POLICY "Admins can update any order"
ON "Order" FOR UPDATE
USING (
  auth.jwt() ->> 'role' = 'ADMIN'
  OR auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE role = 'ADMIN')
);

-- ============================================================
-- OrderItem policies
-- ============================================================
CREATE POLICY "Users can view own order items"
ON "OrderItem" FOR SELECT
USING (
  auth.uid()::text IN (
    SELECT u."supabaseId" FROM "User" u
    JOIN "Order" o ON o."userId" = u.id
    WHERE o.id = "orderId"
  )
  OR auth.jwt() ->> 'role' = 'ADMIN'
);

CREATE POLICY "Users can create own order items"
ON "OrderItem" FOR INSERT
WITH CHECK (
  auth.uid()::text IN (
    SELECT u."supabaseId" FROM "User" u
    JOIN "Order" o ON o."userId" = u.id
    WHERE o.id = "orderId"
  )
);

-- ============================================================
-- Address policies
-- ============================================================
CREATE POLICY "Users can manage own addresses"
ON "Address" FOR ALL
USING (
  auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE id = "userId")
)
WITH CHECK (
  auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE id = "userId")
);

-- ============================================================
-- Review policies
-- ============================================================
CREATE POLICY "Anyone can view reviews"
ON "Review" FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON "Review" FOR INSERT
WITH CHECK (
  auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE id = "userId")
);

CREATE POLICY "Users can update own reviews"
ON "Review" FOR UPDATE
USING (
  auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE id = "userId")
);

CREATE POLICY "Users can delete own reviews"
ON "Review" FOR DELETE
USING (
  auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE id = "userId")
);

-- ============================================================
-- Wishlist policies
-- ============================================================
CREATE POLICY "Users can manage own wishlist"
ON "Wishlist" FOR ALL
USING (
  auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE id = "userId")
)
WITH CHECK (
  auth.uid()::text IN (SELECT "supabaseId" FROM "User" WHERE id = "userId")
);
