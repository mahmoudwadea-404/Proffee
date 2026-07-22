# 12 — User Flow

## Complete Customer Journey

### New Visitor (Anonymous)

```
Landing Page (/)
│
├── Browse Homepage
│   ├── Hero section → "Explore Menu" button
│   ├── Featured Products (PopularPicks) → scroll horizontal cards
│   ├── Testimonials carousel
│   └── Newsletter signup (simulated)
│
├── Product Listing (/products)
│   ├── Filter by roast level (Light, Medium, Dark, etc.)
│   ├── Search by product name
│   └── Sort (newest first — default)
│
├── Product Detail (/products/[slug])
│   ├── View product info (name, description, origin, roast, flavor notes)
│   ├── Select weight option (250g / 500g / 1kg — price updates)
│   ├── "Add to Cart" → adds to localStorage cart
│   ├── "Buy Now" → stores in sessionStorage, redirects to /checkout?buyNow=1
│   └── Related products
│
├── Cart (/cart)
│   ├── View items with images, weights, prices
│   ├── Update quantities (increment/decrement)
│   ├── Remove items
│   ├── See subtotal and free shipping indicator (>EGP 500)
│   └── "Proceed to Checkout" → /checkout
│
├── Checkout (/checkout)
│   ├── Customer Information
│   │   ├── First Name *
│   │   ├── Last Name *
│   │   ├── Email *
│   │   └── Phone *
│   ├── Shipping Address
│   │   ├── Governorate * (dropdown — 27 Egyptian governorates)
│   │   ├── City * (free text)
│   │   ├── Street Address *
│   │   ├── [Pick location on map] → Leaflet modal → lat/lng
│   │   └── Order Notes (optional)
│   ├── Payment Method
│   │   ├── Cash on Delivery (default)
│   │   └── Pay with Card (Paymob)
│   └── Order Summary (sidebar)
│       ├── Items list
│       ├── Subtotal
│       ├── Shipping indicator
│       ├── Total
│       └── [Place Order] / [Pay with Card]
│
├── Order Placement
│   ├── COD Flow:
│   │   ├── createOrder() server action
│   │   ├── User upserted in Prisma (guest record)
│   │   ├── Order + items created in transaction
│   │   ├── Cart cleared
│   │   └── Redirect to /checkout/success?orderId=xxx
│   │
│   └── Card Flow:
│       ├── createCardOrder() server action
│       ├── Order created in Prisma
│       ├── Paymob payment intention created
│       ├── Redirect to Paymob checkout URL
│       ├── User completes payment on Paymob
│       ├── Paymob redirects to /checkout/payment-result?orderId=xxx
│       └── Payment status polling (2s interval)
│
├── Order Confirmation (/checkout/success)
│   ├── Success animation
│   ├── Order ID displayed
│   └── "Continue Shopping" / "Back to Home" buttons
│
└── Payment Result (/checkout/payment-result)
    ├── Polls /api/orders/[id]/payment-status every 2s
    ├── On PAID → show success
    └── On FAILED → show error with retry
```

### Registered User Flow

```
Registration (/register)
├── Enter name, email, password, confirm password
├── Submit → Supabase signUp() with email verification
├── Check email → click verification link
├── /auth/callback → exchange code for session, create Prisma user
└── Redirect to / (now logged in)

Login (/login)
├── Enter email + password
├── Submit → Supabase signInWithPassword()
└── Redirect to / (Navbar shows user menu)

Logged-In Benefits:
├── Cart syncs to server (persists across devices)
├── Navbar shows: user email, My Account link, Admin Panel (if ADMIN), Sign Out
└── Account page (/account) — view profile info

Account (/account)
├── View user name, email
├── (No order history, no saved addresses — not yet implemented)
└── Reset password (/account/reset-password)

Logout:
├── Click "Sign Out" in Navbar dropdown
├── supabase.auth.signOut()
└── Cart falls back to localStorage
```

### Admin Flow

```
Admin Login:
├── Login as ADMIN user
├── Navbar shows "Admin Panel" link
├── Navigate to /admin
└── Auth guard checks role → renders dashboard

Dashboard (/admin):
├── View stats: Total Orders, Revenue, Customers, Products
└── Navigate to Products or Orders

Product Management (/admin/products):
├── View all products in table
├── Search by name
├── Create new product → modal form
├── Edit product → modal form (pre-filled)
├── Delete product → confirmation
└── Toggle featured status

Order Management (/admin/orders):
├── View all orders in table
├── Search by order ID, customer name, or email
├── View customer info, shipping address, items
├── Change order status via dropdown
└── Status updates reflected immediately
```

## Buy Now Flow

```
Product Detail → "Buy Now" button
├── Stores item in sessionStorage("proffee-buy-now")
├── Navigates to /checkout?buyNow=1
├── Checkout reads sessionStorage
├── Displays single item (not cart)
├── On order placement → cart NOT cleared (was never used)
└── sessionStorage cleared on success
```

## Error Scenarios

| Scenario | Handling |
|----------|----------|
| Empty cart checkout | Error message: "Your cart is empty" |
| Submit with empty required fields | Submit button disabled (client-side validation) |
| Server action failure | Error message displayed in checkout form |
| Payment failure | Redirected to payment-result with FAILED status |
| Unauthenticated account access | Redirect to /login |
| Non-admin accessing /admin | Redirect to / |
| Network error during payment polling | Retries every 2 seconds |
