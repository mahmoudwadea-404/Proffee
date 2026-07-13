# FIX_08: Order Visibility & Stale Order Cleanup

**Date:** 2026-07-13
**Scope:** Admin panel error surfacing, stale order cleanup, Paymob webhook verification

---

## What was wrong

### 1. Admin panel showed "No orders yet." when the DB query failed

`getOrders()` in `actions/admin.ts` caught errors and returned `{ success: false }`,
but `app/admin/orders/page.tsx` only checked `result.success && result.orders` —
when the query failed, the page rendered the same empty-state message as "zero orders",
making it impossible to distinguish "no orders exist" from "couldn't reach the database."

**Fix:**
- `actions/admin.ts` `getOrders()` now includes the actual error message in its return:
  `{ success: false, error: "Failed to fetch orders: <message>" }`
- `app/admin/orders/page.tsx` now tracks an `error` state. When `result.success` is
  false, a red error banner is displayed with the specific error message, replacing the
  table. This is visually distinct from the empty-state "No orders yet." message.
- `handleStatusChange` also surfaces errors from the refresh call.

**Confirmed:** `getOrders()` has no hidden filters — it calls `prisma.order.findMany()`
with no WHERE clause, returning ALL orders sorted by `createdAt desc`. No pagination.
If orders exist and the query succeeds, they will all appear.

### 2. `NEXT_PUBLIC_BASE_URL` usage verified correct

`actions/orders.ts:209-270`:
- `const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"`
- `notificationUrl: \`${baseUrl}/api/webhooks/paymob\`` — correct
- `redirectionUrl: \`${baseUrl}/checkout/payment-result?orderId=${order.id}\`` — correct
- `checkEnvVars()` logs at startup whether the env var is set or falling back to localhost
- Full notification + redirection URLs are logged at end of `createCardOrder`

No trailing slash issues. No malformed concatenation. The only fix needed is setting
the env var in Vercel (see "End-to-End Test" section below).

### 3. Webhook field-name/type verification

The `paymobOrderId` field is consistent across the full flow:

| Step | Source | Type | Storage |
|------|--------|------|---------|
| Creation (`actions/orders.ts:248`) | `intention.intentionOrderId` from Paymob `/v1/intention/` response (`data.intention_order_id`) | `number` | `prisma.order.update({ data: { paymobOrderId } })` → schema `Int?` |
| Webhook (`app/api/webhooks/paymob/route.ts:49`) | `obj.order?.id` from Paymob webhook payload | `number` | `prisma.order.findFirst({ where: { paymobOrderId } })` |

Both store/lookup the same Paymob order ID as `number → Int?`. The webhook correctly
uses `findFirst` (not `findUnique`) which handles the case correctly.

---

## Cleanup performed

**26 stale orders** were marked as `paymentStatus: "FAILED"` via the one-off script
`scripts/cleanup-stale-orders.ts`.

**Criteria used:**
- `paymentStatus IN ('PENDING', 'UNPAID')`
- `paymobOrderId IS NULL` (Paymob never linked back)
- `paymentMethod = 'CARD'`
- `createdAt < 1 hour ago` (not a currently-in-progress checkout)

**Before:** 27 total orders — 26 PENDING/UNPAID + 1 PAID
**After:** 27 total orders — 26 FAILED + 1 PAID

Order history is fully preserved; only `paymentStatus` was changed.

The script remains at `scripts/cleanup-stale-orders.ts` and can be re-run if needed
(its WHERE clause is idempotent — running it again finds nothing to do).

---

## End-to-End Test Instructions

After deploying, verify these things in order:

### Prerequisites
1. **Set `NEXT_PUBLIC_BASE_URL=https://proffee.vercel.app`** in Vercel Dashboard
   → Settings → Environment Variables → Production
2. **Redeploy** (Vercel doesn't pick up new env vars without a fresh deploy)

### Test Steps
1. Go to `https://proffee.vercel.app` and add a coffee to the cart
2. Proceed to checkout, fill in test details, select "Pay with Card"
3. You'll be redirected to Paymob's hosted checkout page
4. Use Paymob test card: `4111 1111 1111 1111`, any future expiry, any CVV
5. Complete the payment

### What to check
- **Paymob dashboard:** Verify the webhook was sent to
  `https://proffee.vercel.app/api/webhooks/paymob` (not localhost)
- **Vercel Runtime Logs:** Check for `PAYMOB WEBHOOK RECEIVED` log entries under
  the `/api/webhooks/paymob` route
- **Admin panel:** Go to `/admin/orders` — the new order should appear with
  `paymentStatus: PAID` (the status column in the table shows `order.status`, not
  `paymentStatus`; check the database directly if needed)
- **Payment result page:** After Paymob redirect, the page should show "Payment
  Successful" and polling should stop at PAID status

### If the webhook still doesn't arrive
- Check Vercel logs for the `createCardOrder` output — look for the logged
  `Notification URL (webhook)` and `Redirect URL (redirectionUrl)` lines
- Confirm both show `https://proffee.vercel.app/...` not `http://localhost:3000/...`
- If still showing localhost, the env var wasn't picked up — trigger another deploy
