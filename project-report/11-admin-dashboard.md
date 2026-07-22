# 11 — Admin Dashboard

## Overview

| Property | Detail |
|----------|--------|
| **Entry** | `/admin` |
| **Layout** | `app/admin/layout.tsx` (client component with sidebar + auth guard) |
| **Access** | ADMIN role only (checked client-side) |
| **Data fetching** | Server Actions (`actions/admin.ts`) called in `useEffect` |

## Pages

### 1. Dashboard (`/admin`)

**File:** `app/admin/page.tsx`

| Feature | Detail |
|---------|--------|
| **Stats displayed** | Total Orders, Total Revenue (EGP), Total Customers, Total Products |
| **Data source** | `getStats()` server action |
| **Layout** | 4 stat cards in a grid with icons |
| **Animation** | Framer Motion fade-in on load |

### 2. Products (`/admin/products`)

**File:** `app/admin/products/page.tsx` (~544 lines)

| Feature | Detail |
|---------|--------|
| **Table columns** | Product Name, Price, Stock, Roast Level, Featured, Actions |
| **Search** | Client-side filter by product name |
| **CRUD** | Create, Update, Delete via modal form |
| **Image upload** | File input with preview (stores URL, actual Supabase Storage integration not fully wired) |
| **Modal** | Inline modal with form fields for all product properties |
| **Data source** | `getProducts()`, `createProduct()`, `updateProduct()`, `deleteProduct()` |

**Product form fields:**
- Name, Slug (auto-generated from name), Description, Long Description
- Origin, Price, Stock, Roast Level (dropdown)
- Flavor Notes (comma-separated input), Weight Options (dynamic add/remove rows)
- Image URL, Featured (checkbox)

### 3. Orders (`/admin/orders`)

**File:** `app/admin/orders/page.tsx`

| Feature | Detail |
|---------|--------|
| **Table columns** | Order ID (truncated), Customer (name + email), Items, Shipping (name, governorate, city, address), Total (EGP), Payment, Status, Date |
| **Search** | Client-side filter by order ID, customer name, or email |
| **Status management** | Inline dropdown to change order status |
| **Data source** | `getOrders()`, `updateOrderStatus()` |

**Status colors:**

| Status | Color Class |
|--------|------------|
| PENDING | `bg-yellow-500/20 text-yellow-500` |
| CONFIRMED | `bg-blue-500/20 text-blue-500` |
| PROCESSING | `bg-purple-500/20 text-purple-500` |
| SHIPPED | `bg-indigo-500/20 text-indigo-500` |
| DELIVERED | `bg-green-500/20 text-green-500` |
| CANCELLED | `bg-red-500/20 text-red-500` |

## Sidebar Navigation

```typescript
// app/admin/layout.tsx
const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Coffee },
  { label: "Orders", href: "/admin/orders", icon: Package },
]
```

## Auth Guard Flow

```
Admin layout mounts
  → supabase.auth.getUser()
  → If no user → redirect to /login
  → Fetch GET /api/user/role?email={email}
  → If role !== "ADMIN" → redirect to /
  → If ADMIN → render sidebar + content
```

## Server Actions Used

| Action | File | Used By |
|--------|------|---------|
| `getStats()` | `actions/admin.ts` | Dashboard page |
| `getProducts()` | `actions/admin.ts` | Products page |
| `createProduct()` | `actions/admin.ts` | Products modal |
| `updateProduct()` | `actions/admin.ts` | Products modal |
| `deleteProduct()` | `actions/admin.ts` | Products table delete |
| `getOrders()` | `actions/admin.ts` | Orders page |
| `updateOrderStatus()` | `actions/admin.ts` | Orders status dropdown |

## Limitations

1. **No order detail view** — Orders are only shown in a table; clicking an order does not open a detail page
2. **No revenue analytics** — Dashboard shows only a total revenue number, no charts or trends
3. **No customer management** — No way to view or manage individual customers
4. **No inventory alerts** — No low-stock warnings
5. **No bulk operations** — No bulk status update, bulk delete, etc.
6. **No export functionality** — No CSV/PDF export of orders or products
7. **Client-side search only** — Search is filtering the already-loaded array, not querying the database
8. **No pagination** — All orders/products loaded at once (could be slow with many records)
9. **Image upload incomplete** — The UI accepts file input but the actual storage upload to Supabase Storage is not implemented in the action layer
