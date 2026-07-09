# FIX 07 — Paymob Payment Integration (Sandbox)

## Overview

Integrated Paymob's **Intention API (v1)** — their current recommended flow — as a card payment option alongside the existing Cash on Delivery (COD) method. The integration uses Paymob's Egypt sandbox environment (`https://accept.paymob.com`).

**Docs references:**
- Intention API: https://developers.paymob.com/paymob-docs/developers/intention-apis/create-intention
- OpenAPI spec: https://raw.githubusercontent.com/api-evangelist/paymob/main/openapi/paymob-intentions-api-openapi.yml
- HMAC validation: https://developers.paymob.com/paymob-docs/developers/webhook-callbacks-and-hmac
- Official skill/node.js reference: https://github.com/PaymobAccept/Paymob-Claude-Integration-Skill

---

## Flow Summary

```
User selects "Pay with Card" → submits checkout form
    ↓
Server action creates Order in DB (paymentStatus: "PENDING", paymentMethod: "CARD")
    ↓
Server creates Paymob payment intention via POST /v1/intention/ (includes notification_url + redirection_url)
    ↓
Server stores Paymob intention ID + order ID on the order record
    ↓
Server returns Paymob checkout URL → client redirects user
    ↓
User pays on Paymob's hosted Unified Checkout page (test cards work)
    ↓
[Server-to-server] Paymob POSTs transaction result → /api/webhooks/paymob?hmac=...
    ↓
[Server-to-server] Webhook handler verifies HMAC-SHA512 → updates order.paymentStatus to PAID or FAILED
    ↓
[Client redirect] Paymob redirects user back → /checkout/payment-result?orderId=...
    ↓
Payment result page polls /api/orders/[id]/payment-status → shows success/failure
```

---

## New Files Created

| File | Purpose |
|---|---|
| `lib/paymob.ts` | Paymob service module: `createPaymentIntention()`, `getCheckoutUrl()`, `verifyWebhookHMAC()` |
| `app/api/webhooks/paymob/route.ts` | Webhook callback: receives POST, verifies HMAC, updates order status |
| `app/api/orders/[id]/payment-status/route.ts` | API endpoint for payment result page to poll order payment status |
| `app/(public)/checkout/payment-result/page.tsx` | Server component for payment result page |
| `app/(public)/checkout/payment-result/page.client.tsx` | Client component: polls status, shows success/failure UI |

## Files Modified

| File | Change |
|---|---|
| `prisma/schema.prisma` | Added `paymobTransactionId String?`, `paymobOrderId Int?` to Order model |
| `actions/orders.ts` | Added `CreateCardOrderInput`, `createCardOrder` action; added `name` field to `CreateOrderInput.items` |
| `app/(public)/checkout/page.client.tsx` | Added "Pay with Card" radio button, card payment submit logic |
| `.env` | Added `PAYMOB_PUBLIC_KEY` placeholder |

## Database Schema Changes (Order model)

```prisma
model Order {
  // ... existing fields ...
  paymentStatus       String      @default("UNPAID")   // UNPAID | PENDING | PAID | FAILED
  paymentMethod       String?                           // COD | CARD
  paymobTransactionId String?                           // Paymob intention ID (uuid)
  paymobOrderId       Int?                              // Paymob order ID (integer)
  // ... existing fields ...
}
```

Run `npx prisma db push` to sync changes (already done).

## Key Implementation Details

### `lib/paymob.ts` — `createPaymentIntention()`

- Calls `POST https://accept.paymob.com/v1/intention/`
- Auth: `Authorization: Token <PAYMOB_API_KEY>` (the env var value is Paymob's "secret key")
- Amount is in **cents** (piasters): `EGP 150.00 → 15000`
- Sets `special_reference` to our internal order ID for correlation
- Sets `notification_url` to the webhook endpoint
- Sets `redirection_url` to the payment result page

### `lib/paymob.ts` — `verifyWebhookHMAC()`

Uses **SHA-512** HMAC. Concatenates exactly **20 fields** from `obj.*` as strings (no separator) in this exact order:

```
1.  obj.amount_cents
2.  obj.created_at
3.  obj.currency
4.  obj.error_occured
5.  obj.has_parent_transaction
6.  obj.id
7.  obj.integration_id
8.  obj.is_3d_secure
9.  obj.is_auth
10. obj.is_capture
11. obj.is_refunded
12. obj.is_standalone_payment
13. obj.is_voided
14. obj.order.id
15. obj.owner
16. obj.pending
17. obj.source_data.pan
18. obj.source_data.sub_type
19. obj.source_data.type
20. obj.success
```

Uses `crypto.timingSafeEqual()` for the final comparison to prevent timing attacks.

### Webhook Handler (`app/api/webhooks/paymob/route.ts`)

- Paymob sends POST to `{notification_url}?hmac=...`
- Extracts `obj` from request body and `hmac` from query params
- **Rejects with 401 if HMAC is missing or invalid** (critical security step)
- On valid verified success: updates order `paymentStatus` → `"PAID"`
- On valid verified failure: updates order `paymentStatus` → `"FAILED"`
- Matches order via `paymobOrderId` (stored during intention creation)
- Returns `{"received": true}` as Paymob expects

---

## Environment Variables

Ensure these are all set in `.env`:

```
PAYMOB_API_KEY=ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5...
PAYMOB_INTEGRATION_ID=5772236
PAYMOB_HMAC_SECRET=CE203765A3EA19CDDF72C6FAF58D8AAA
PAYMOB_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY_HERE     ← SET THIS from Paymob dashboard
```

### `NEXT_PUBLIC_BASE_URL`

The `createCardOrder` action uses `NEXT_PUBLIC_BASE_URL` (falls back to `http://localhost:3000`) to construct the `notification_url` and `redirection_url`. For production, set:

```
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## Test Card Numbers (Sandbox)

From Paymob's official test credentials page (https://developers.paymob.com/paymob-docs/need-help/faq/test-credentials.md):

| Scenario | Card Number | Expiry | CVV |
|---|---|---|---|
| ✅ Successful payment | `5123456789012346` | 01/39 | 123 |
| ✅ Successful payment | `4987654321098769` | Any future date | Any 3 digits |
| ❌ Failed payment | `4111111111111111` | Any future date | Any 3 digits |

---

## How to Test Locally

### Step 1: Add the public key

1. Log in to the [Paymob Dashboard](https://accept.paymob.com/)
2. Go to **Developers → Payment Integrations**
3. Copy your **Public Key** (starts with `pk_test_`)
4. Add it to `.env`: `PAYMOB_PUBLIC_KEY=pk_test_...`

### Step 2: Test the checkout flow

```bash
npm run dev
```

1. Visit `http://localhost:3000`
2. Add a product to cart
3. Go to checkout
4. Select **"Pay with Card"**
5. Fill in the form and click **"Pay with Card"**
6. You should be redirected to Paymob's hosted checkout page
7. Enter one of the test card numbers above
8. After payment, you'll be redirected back to the payment result page

### Step 3: Webhook testing — IMPORTANT

**The webhook callback requires a publicly reachable URL.** Paymob's server sends the POST to your `notification_url`. On `localhost`, this won't work.

**Option A: Use ngrok (for local testing)**

```bash
ngrok http 3000
```

Then set `NEXT_PUBLIC_BASE_URL` to the ngrok URL in a local `.env.local`:

```
NEXT_PUBLIC_BASE_URL=https://your-ngrok-subdomain.ngrok.io
```

Restart the dev server and do a full checkout test. Paymob will call your ngrok URL for the webhook.

**Option B: Test on Vercel preview deployment**

Deploy to Vercel and set `NEXT_PUBLIC_BASE_URL` to the preview URL. The webhook will work without ngrok.

### Step 4: Verify COD still works

Test the existing COD flow — it should work exactly as before with zero changes. The `"Pay with Card"` addition is purely additive.

---

## Verification Checklist

- [ ] `npx tsc --noEmit` passes → ✅ verified
- [ ] `npm run build` succeeds → ✅ verified
- [ ] COD checkout flow works with zero regression → confirmed (no COD code changed)
- [ ] `PAYMOB_PUBLIC_KEY` added to `.env` from Paymob dashboard
- [ ] `NEXT_PUBLIC_BASE_URL` set for production deployment
- [ ] Webhook endpoint is publicly accessible (ngrok for local, Vercel URL for prod)
- [ ] Test with `5123456789012346` → order should show `PAID`
- [ ] Test with `4111111111111111` → order should show `FAILED`
