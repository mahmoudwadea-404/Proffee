# 05 — Components

## Layout Components

### `components/layout/Navbar.tsx`

| Property | Detail |
|----------|--------|
| **Type** | Client Component (`"use client"`) |
| **Props** | None (self-contained) |
| **State** | `isOpen` (mobile menu), `user` (Supabase User), `loading`, `isAdmin` |
| **Dependencies** | `next/link`, `next/navigation` (usePathname), `framer-motion`, `lucide-react`, `@/lib/supabase/client`, `@/lib/cart-context` |
| **Parent** | `app/(public)/layout.tsx` |
| **Children** | None (leaf component) |
| **Reusable** | Yes — global navigation |
| **Responsibility** | Sticky top nav with: brand link, desktop nav links (Home, Products, Our Story, Contact) with active indicator animation, cart icon with badge count, auth state detection (Supabase session listener), user dropdown (Admin Panel link if admin, My Account, Sign Out), mobile hamburger menu with slide-in animation |

### `components/layout/Footer.tsx`

| Property | Detail |
|----------|--------|
| **Type** | Client Component (`"use client"`) |
| **Props** | None |
| **State** | None |
| **Dependencies** | `next/link`, `lucide-react` |
| **Parent** | `app/(public)/layout.tsx` |
| **Children** | None |
| **Reusable** | Yes — global footer |
| **Responsibility** | 4-column footer: Newsletter signup (non-functional), Quick Links, Customer Care links, Contact info (phone, email, address in Al-Husseiniya, Alsharqia, Egypt). Social links (Facebook, Instagram). Copyright 2026. |

---

## Homepage Components (`components/home/`)

### `Hero.tsx`
- **Type:** Client Component
- **Props:** None
- **State:** None (uses refs for intersection observer)
- **Responsibility:** Full-viewport hero section with animated text ("Rich. Smooth. Perfect." in script font), CTA buttons, hero image with gradient mask, feature icons (100% Arabica, Premium Quality, Fast Delivery, Freshly Roasted). All elements stagger-animate on load.
- **Image:** `/images/proffee-hero-coffee.jpg`

### `FeaturesRibbon.tsx`
- **Type:** Client Component
- **Props:** None
- **Responsibility:** Horizontal 4-card ribbon: Free Delivery (>EGP 1000), Fresh & Fast, Secure Payment, Loyalty Rewards. Animated on scroll with staggered delays.

### `PopularPicks.tsx`
- **Type:** Client Component
- **Props:** `{ products: FeaturedProduct[] }`
- **Dependencies:** `@/lib/cart-context` (useCart), `@/lib/db-products` (FeaturedProduct type)
- **Responsibility:** Horizontally scrollable product cards with "Add to Cart" and "Buy Now" buttons. "Buy Now" stores item in `sessionStorage` as `proffee-buy-now` and navigates to `/checkout?buyNow=1`.

### `Testimonials.tsx`
- **Type:** Client Component
- **Props:** None
- **State:** `current` (active index), `direction` (slide direction)
- **Data:** 4 hardcoded testimonials (Sarah Ahmed, Mohamed Ali, Nour Hassan, Khaled Omar)
- **Responsibility:** Animated carousel with star ratings, prev/next arrows, dot indicators.

### `Newsletter.tsx`
- **Type:** Client Component
- **Props:** None
- **State:** `email`, `status` (idle/loading/success)
- **Responsibility:** Email newsletter signup. **Simulated** — no actual API call (1s setTimeout). Shows success state after "submission."

### `FAQ.tsx`
- **Type:** Client Component
- **Props:** None
- **State:** `openIndex`
- **Data:** 5 hardcoded FAQ items
- **Responsibility:** Single-open accordion with animated expand/collapse.

### `AboutSection.tsx`
- **Type:** Client Component
- **Props:** None
- **Responsibility:** Two-column section: image + "Passion That Transcends Coffee" content with 4 feature highlights and "Learn More" CTA.

---

## Checkout Components (`components/checkout/`)

### `LocationPicker.tsx`
- **Type:** Client Component
- **Props:** `{ isOpen, onClose, onConfirm, initialLat?, initialLng? }`
- **State:** `selectedLat`, `selectedLng`
- **Dependencies:** `next/dynamic` (lazy-loads LocationPickerMap with `{ ssr: false }`)
- **Responsibility:** Full-screen modal for OpenStreetMap location picker. Dark overlay, header with MapPin icon, map area, coordinate display, Cancel/Confirm buttons.

### `LocationPickerMap.tsx`
- **Type:** Client Component
- **Props:** `{ onPick, initialLat?, initialLng? }`
- **State:** `position: [number, number]` (default Cairo: 30.0444, 31.2357)
- **Dependencies:** `react-leaflet` (MapContainer, TileLayer, Marker, useMap, useMapEvents), `leaflet`
- **Internal Components:** `ClickHandler` (map click), `DragHandler` (marker drag)
- **Responsibility:** Interactive Leaflet map with draggable marker. Fires `onPick` on click and drag. Configures Leaflet marker icons from unpkg CDN to fix bundler path issue.

---

## Component Summary Table

| Component | File | Client? | Has State | Reusable | Category |
|-----------|------|---------|-----------|----------|----------|
| Navbar | `components/layout/Navbar.tsx` | Yes | Yes (auth, menu) | Global | Layout |
| Footer | `components/layout/Footer.tsx` | Yes | No | Global | Layout |
| Hero | `components/home/Hero.tsx` | Yes | No | Homepage | Marketing |
| FeaturesRibbon | `components/home/FeaturesRibbon.tsx` | Yes | No | Homepage | Marketing |
| PopularPicks | `components/home/PopularPicks.tsx` | Yes | Refs only | Homepage | Product |
| Testimonials | `components/home/Testimonials.tsx` | Yes | Yes (carousel) | Homepage | Marketing |
| Newsletter | `components/home/Newsletter.tsx` | Yes | Yes (email, status) | Homepage | Marketing |
| FAQ | `components/home/FAQ.tsx` | Yes | Yes (openIndex) | Homepage | Content |
| AboutSection | `components/home/AboutSection.tsx` | Yes | No | Homepage | Marketing |
| LocationPicker | `components/checkout/LocationPicker.tsx` | Yes | Yes (coords) | Checkout | Map |
| LocationPickerMap | `components/checkout/LocationPickerMap.tsx` | Yes | Yes (position) | Checkout | Map |
