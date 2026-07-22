# 07 — Context Providers

## CartContext (`lib/cart-context.tsx`)

The project has **one React Context**: the Cart Context. It is the only shared state mechanism beyond component-local `useState`.

### Provider: `CartProvider`

| Property | Detail |
|----------|--------|
| **File** | `lib/cart-context.tsx` |
| **Type** | Client Component (`"use client"`) |
| **Wraps** | `app/layout.tsx` (entire application) |
| **Children** | All pages and components |

### State

| Field | Type | Initial Value | Source |
|-------|------|---------------|--------|
| `items` | `CartItem[]` | `[]` → loaded from `localStorage` on mount | Local storage key: `proffee-cart` |
| `userId` | `string \| null` | `null` → resolved from Supabase session | `getPrismaUserId()` server action |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `addItem` | `(item: Omit<CartItem, "quantity">, quantity?: number) => void` | Add to cart. If item exists (same productId + weight), increments quantity. Optimistically updates local state, also calls `addServerCartItem()` if authenticated. |
| `removeItem` | `(productId: string, weight: string) => void` | Remove item by productId + weight. Calls `removeServerCartItem()` if authenticated. |
| `updateQuantity` | `(productId: string, weight: string, quantity: number) => void` | Set quantity for item. Calls `updateServerCartItemQuantity()` if authenticated. |
| `clearCart` | `() => void` | Empty cart. Calls `clearServerCart()` if authenticated. |

### Derived Values

| Field | Type | Computation |
|-------|------|-------------|
| `itemCount` | `number` | `items.reduce((sum, i) => sum + i.quantity, 0)` |
| `subtotal` | `number` | `items.reduce((sum, i) => sum + i.price * i.quantity, 0)` |

### CartItem Interface

```typescript
interface CartItem {
  id?: string              // Server cart item ID (if authenticated)
  productId: string        // Product reference
  slug: string             // Product URL slug
  name: string             // Product display name
  image: string            // Product image URL
  price: number            // Price for selected weight
  weight: number           // Weight in grams (number)
  weightLabel: string      // Display label ("250g", "500g", "1kg")
  quantity: number         // Quantity in cart
}
```

### Initialization Flow

```
CartProvider mounts
  │
  ├─ useEffect #1 (mount): Load cart from localStorage("proffee-cart")
  │   └─ Set items state from stored cart
  │
  ├─ useEffect #2 (auth change): Supabase auth listener
  │   ├─ If user logged in:
  │   │   ├─ Resolve Supabase ID → Prisma user ID (getPrismaUserId)
  │   │   ├─ Load server cart (getServerCart)
  │   │   ├─ Merge any localStorage items into server cart (mergeServerCart)
  │   │   ├─ Replace local items with server cart items
  │   │   └─ Set userId
  │   │
  │   └─ If user logged out:
  │       └─ Set userId to null (keep localStorage cart)
  │
  └─ useEffect #3 (items change): Save cart to localStorage
      └─ Skipped on first render (ref flag) to avoid overwriting server cart
```

### Consumers

| Component | Access Pattern |
|-----------|---------------|
| `app/layout.tsx` | `<CartProvider>{children}</CartProvider>` — wraps entire app |
| `components/layout/Navbar.tsx` | `useCart()` → `itemCount` for cart badge |
| `components/home/PopularPicks.tsx` | `useCart()` → `addItem()` for add-to-cart buttons |
| `app/(public)/cart/page.client.tsx` | `useCart()` → all cart operations |
| `app/(public)/checkout/page.client.tsx` | `useCart()` → `items`, `subtotal`, `itemCount`, `clearCart` |

### Dual-Mode Behavior

| State | Anonymous User | Authenticated User |
|-------|---------------|-------------------|
| **Storage** | `localStorage` only | Prisma DB + `localStorage` (transitional) |
| **Add item** | localStorage write | Prisma `CartItem.create` + local state |
| **Remove item** | localStorage write | Prisma `CartItem.delete` + local state |
| **On login** | — | localStorage items merged into server cart |
| **On logout** | — | Local state retains server cart (falls back to localStorage) |

### Observations

1. **No error handling** — Server action failures (cart sync) are silently ignored. If the DB write fails, the local state still updates.
2. **No optimistic UI rollback** — If a server action fails, the local state is not reverted.
3. **No cart persistence on page refresh for anonymous users** — localStorage is used, but items added before a hard refresh may be lost if the key is cleared.
4. **Single context** — No separate wishlist context despite the `Wishlist` model existing in the database.
