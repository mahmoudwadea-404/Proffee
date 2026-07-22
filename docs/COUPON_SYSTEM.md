# Coupon System

Complete coupon system for the Proffee e-commerce platform.

## Database Design

### Coupon Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `code` | String (unique) | Coupon code, stored uppercase |
| `description` | String | Human-readable description |
| `discountType` | Enum | `PERCENTAGE` or `FIXED` |
| `discountValue` | Float | Percentage (0-100) or fixed amount (EGP) |
| `maximumDiscount` | Float? | Cap for percentage discounts |
| `minOrderAmount` | Float? | Minimum subtotal required |
| `maxUses` | Int? | Total usage limit (null = unlimited) |
| `usedCount` | Int | Current usage count |
| `isActive` | Boolean | Enable/disable toggle |
| `startsAt` | DateTime? | When the coupon becomes valid |
| `expiresAt` | DateTime? | When the coupon expires |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### Order Model (coupon fields)

| Field | Type | Description |
|-------|------|-------------|
| `subtotal` | Float | Sum of items before shipping/discount |
| `shippingFee` | Float | Fixed EGP 60 |
| `discountAmount` | Float | Discount applied via coupon |
| `couponId` | String? | FK to Coupon |
| `couponCode` | String | Denormalized code for display |
| `total` | Float | Final amount: subtotal + shippingFee - discountAmount |

## Folder Structure

```
lib/
  constants.ts              # SHIPPING_FEE = 60
actions/
  coupons.ts                # validateCoupon() server action
  admin.ts                  # Coupon CRUD (getCoupons, createCoupon, updateCoupon, deleteCoupon)
  orders.ts                 # createOrder(), createCardOrder() — server-side coupon validation
app/
  admin/
    coupons/page.tsx        # Admin coupon management page
    layout.tsx              # Sidebar nav includes Coupons link
    orders/page.tsx         # Shows coupon code + discount per order
  (public)/
    checkout/page.client.tsx # Coupon input UI in Order Summary
```

## Coupon Flow

1. **Admin creates coupon** via `/admin/coupons` — code is uppercased, stored in DB
2. **Customer enters code** at checkout — `validateCoupon()` called client-side for instant feedback
3. **Customer places order** — server re-validates coupon, recalculates total, increments `usedCount` inside a transaction
4. **Admin views orders** — coupon code and discount shown in order table

## Validation Flow

`validateCoupon(code, subtotal)` checks, in order:

1. Code is non-empty
2. Coupon exists (by unique code)
3. `isActive === true`
4. `startsAt` is null or `<= now`
5. `expiresAt` is null or `>= now`
6. `usedCount < maxUses` (if maxUses is set)
7. `subtotal >= minOrderAmount` (if minOrderAmount is set)

Discount calculation:
- **PERCENTAGE:** `discount = (subtotal * discountValue) / 100`, capped by `maximumDiscount` if set
- **FIXED:** `discount = min(discountValue, subtotal)`

Returns structured response:
```ts
{
  valid: boolean
  message: string
  discount: number
  finalTotal: number    // subtotal + SHIPPING_FEE - discount
  coupon: { id, code, discountType, discountValue, maximumDiscount, description } | null
}
```

## Checkout Flow

1. Customer fills shipping form
2. Enters coupon code in Order Summary sidebar
3. Clicks "Apply" → `validateCoupon()` called
4. On success: discount line appears, grand total updates
5. On failure: error message shown below input
6. Click "X" to remove applied coupon
7. Grand Total = Subtotal + EGP 60 - Discount

## Order Creation Flow

Both `createOrder()` (COD) and `createCardOrder()` (Card):

1. **Recalculate** subtotal from items (never trust client)
2. **Apply** fixed SHIPPING_FEE = 60
3. **Re-validate** coupon if code provided (never trust client)
4. **Recalculate** discount and total server-side
5. **Inside transaction:**
   - Increment `usedCount` on coupon (if valid)
   - Create order with all calculated values
6. **Return** orderId (COD) or checkoutUrl (Card)

## Admin Flow

- `/admin/coupons` — list, search, create, edit, delete coupons
- Table columns: Code, Type, Value, Min Order, Max Discount, Usage, Status, Expires, Actions
- Form fields: Code, Description, Discount Type, Value, Min Order, Max Discount, Usage Limit, Start Date, Expiration Date, Active toggle
- Protected by: `proxy.ts` (session check) + `admin/layout.tsx` (ADMIN role check)

## Security Decisions

1. **Never trust the client** — coupon validation and discount calculation always happen server-side
2. **Server recalculates subtotal** from cart items, not from client-sent total
3. **Transaction safety** — coupon `usedCount` increment and order creation are in the same `prisma.$transaction`
4. **Admin-only CRUD** — coupon create/edit/delete requires ADMIN role (enforced by layout + proxy)
5. **Coupon code uppercased** — stored and compared case-insensitively

## Shipping Rule

- Fixed shipping fee: **EGP 60** for all orders
- Defined in `lib/constants.ts` as `SHIPPING_FEE = 60`
- Stored per-order in `Order.shippingFee`
- Grand Total = Subtotal + 60 - Discount

## Future Expansion

The Coupon model supports adding these features without schema changes:

| Feature | How |
|---------|-----|
| First-order coupons | Check user's order count in `validateCoupon()` |
| User-specific coupons | Add `userId` FK to Coupon model |
| Product coupons | Add `productId` FK or junction table |
| Category coupons | Add `category` field to Coupon |
| Free shipping coupons | Add `FREE_SHIPPING` to DiscountType enum |
| Buy X Get Y | Add separate model for coupon rules |
| Max uses per user | Add `CouponUsage` junction table |
| One coupon per order | Already enforced — single couponId on Order |
