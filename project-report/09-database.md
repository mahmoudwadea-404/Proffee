# 09 — Database

## Overview

| Property | Detail |
|----------|--------|
| **Database** | PostgreSQL (hosted on Supabase) |
| **Provider** | Supabase (AWS eu-west-1 pooler) |
| **ORM** | Prisma 6.19.3 |
| **Schema** | `prisma/schema.prisma` |
| **Migration** | `npx prisma db push` (project convention, not `prisma migrate`) |
| **Seed** | `prisma/seed.ts` (8 coffee products) |

## Models

### User

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `supabaseId` | `String` | `@unique` | Maps to Supabase auth UUID |
| `name` | `String` | required | Full name |
| `email` | `String` | `@unique` | Used for guest order upsert |
| `role` | `UserRole` | `@default(CUSTOMER)` | CUSTOMER or ADMIN |
| `phone` | `String?` | optional | |
| `createdAt` | `DateTime` | `@default(now())` | |
| `updatedAt` | `DateTime` | `@updatedAt` | |

**Relations:** orders[], reviews[], wishlist[], cartItems[], addresses[]

### Product

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| `id` | `String` | `@id @default(cuid())` | |
| `name` | `String` | required | Bilingual (English + Arabic) |
| `slug` | `String` | `@unique` | URL-friendly identifier |
| `description` | `String` | required | Short description |
| `longDescription` | `String?` | optional | Full product description |
| `origin` | `String?` | optional | Coffee origin (Ethiopia, Colombia, etc.) |
| `price` | `Float` | required | Base price in EGP |
| `stock` | `Int` | required | Inventory count |
| `roastLevel` | `String` | required | Light/Medium/Dark/etc. |
| `flavorNotes` | `String[]` | required | Array of flavor descriptors |
| `weightOptions` | `Json` | required | `[{ label, grams, price }]` |
| `imageUrl` | `String` | required | Primary image path |
| `images` | `String[]` | required | Image gallery |
| `featured` | `Boolean` | `@default(false)` | Show on homepage |

**Relations:** orderItems[], reviews[], wishlist[], cartItems[]

### Order

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| `id` | `String` | `@id @default(cuid())` | |
| `userId` | `String` | FK → User | |
| `status` | `OrderStatus` | `@default(PENDING)` | Order fulfillment status |
| `paymentStatus` | `String` | `@default("UNPAID")` | UNPAID/PENDING/PAID/FAILED |
| `paymentMethod` | `String?` | optional | "COD" or "CARD" |
| `paymobTransactionId` | `String?` | optional | Paymob transaction ID |
| `paymobOrderId` | `Int?` | optional | Paymob order ID |
| `total` | `Float` | required | Order total in EGP |
| `shippingAddress` | `Json` | required | Legacy: `{ street, city, governorate }` |
| `firstName` | `String` | `@default("")` | Customer first name |
| `lastName` | `String` | `@default("")` | Customer last name |
| `governorate` | `String` | `@default("")` | Egyptian governorate |
| `city` | `String` | `@default("")` | City within governorate |
| `address` | `String` | `@default("")` | Street address |
| `latitude` | `Float?` | optional | From map picker |
| `longitude` | `Float?` | optional | From map picker |
| `phone` | `String` | required | Delivery phone |
| `notes` | `String?` | optional | Order notes |
| `createdAt` | `DateTime` | `@default(now())` | |
| `updatedAt` | `DateTime` | `@updatedAt` | |

**Relations:** user, items[]

### OrderItem

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| `id` | `String` | `@id @default(cuid())` | |
| `orderId` | `String` | FK → Order | |
| `productId` | `String` | FK → Product | |
| `quantity` | `Int` | required | |
| `price` | `Float` | required | Price at time of order |
| `weight` | `String?` | optional | Weight label |

### CartItem

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| `id` | `String` | `@id @default(cuid())` | |
| `userId` | `String` | FK → User | |
| `productId` | `String` | FK → Product | |
| `quantity` | `Int` | required | |
| `weight` | `String?` | optional | Weight label |

### Address

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| `id` | `String` | `@id @default(cuid())` | |
| `userId` | `String` | FK → User | |
| `label` | `String` | required | e.g., "Home", "Work" |
| `street` | `String` | required | |
| `city` | `String` | required | |
| `isDefault` | `Boolean` | `@default(false)` | |

**Note:** The `Address` model exists in the schema but is **not used** by any application code. It appears to be a placeholder for a future "saved addresses" feature.

### Review

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| `id` | `String` | `@id @default(cuid())` | |
| `userId` | `String` | FK → User | |
| `productId` | `String` | FK → Product | |
| `rating` | `Int` | required | Star rating |
| `comment` | `String` | required | Review text |
| `createdAt` | `DateTime` | `@default(now())` | |

**Note:** The `Review` model exists but **no UI or server action** creates or displays reviews. The product detail page shows placeholder review data.

### Wishlist

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| `id` | `String` | `@id @default(cuid())` | |
| `userId` | `String` | FK → User | |
| `productId` | `String` | FK → Product | |
| `createdAt` | `DateTime` | `@default(now())` | |

**Note:** The `Wishlist` model exists but **no UI or server action** uses it.

## Enums

### UserRole
- `CUSTOMER` (default)
- `ADMIN`

### OrderStatus
- `PENDING` (default)
- `CONFIRMED`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

## Entity Relationship Diagram

```
User ──┬── Order ──── OrderItem ──── Product
       ├── CartItem ──── Product
       ├── Address
       ├── Review ──── Product
       └── Wishlist ──── Product
```

## Seed Data

`prisma/seed.ts` seeds 8 products:

| Product | Roast | Price (250g) | Featured |
|---------|-------|-------------|----------|
| Plain Light Roast | Light | EGP 180 | Yes |
| Plain Medium Roast | Medium | EGP 170 | Yes |
| Plain Dark Roast | Dark | EGP 175 | Yes |
| Mahwaj Light Roast | Light | EGP 200 | No |
| Mahwaj Medium Roast | Medium | EGP 195 | No |
| Mahwaj Dark Roast | Dark | EGP 205 | No |
| French Roast | Dark | EGP 190 | Yes |
| French Hazelnut | Medium-Dark | EGP 210 | Yes |

## Observations

1. **`Address` model is unused** — No code reads from or writes to it
2. **`Review` model is unused** — No UI or server action for reviews
3. **`Wishlist` model is unused** — No UI or server action for wishlists
4. **`shippingAddress` JSON is legacy** — New structured fields (`firstName`, `lastName`, etc.) exist alongside it; both are populated on order creation
5. **`paymentStatus` is a String, not an enum** — Values are "UNPAID", "PENDING", "PAID", "FAILED" but there's no Prisma enum enforcing this
6. **No indexes beyond default** — No explicit `@@index` directives on any model (Prisma creates indexes on FK fields by default)
7. **`CartItem` has no unique constraint** on `(userId, productId, weight)` — deduplication is handled in application code
