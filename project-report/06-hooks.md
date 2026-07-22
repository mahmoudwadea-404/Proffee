# 06 — Hooks

## Custom Hooks

The project has **no dedicated `hooks/` directory** and defines **no standalone custom hooks** in separate files. All hook logic is inline within components.

## Implicit Hook: `useCart()`

**Defined in:** `lib/cart-context.tsx`

| Property | Detail |
|----------|--------|
| **Purpose** | Access the cart context value from any child component of `CartProvider` |
| **Inputs** | None (uses `React.useContext`) |
| **Outputs** | `{ items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart }` |
| **Side effects** | None (state mutations happen in the provider, not in this hook) |
| **Dependencies** | `CartContext` (React.createContext) |

### Return Value Breakdown

| Field | Type | Description |
|-------|------|-------------|
| `items` | `CartItem[]` | Current cart items |
| `itemCount` | `number` | Sum of all item quantities |
| `subtotal` | `number` | Sum of (price × quantity) for all items |
| `addItem` | `(item, quantity) => void` | Add item to cart (increment if exists) |
| `removeItem` | `(productId, weight) => void` | Remove item from cart |
| `updateQuantity` | `(productId, weight, quantity) => void` | Set item quantity |
| `clearCart` | `() => void` | Remove all items |

### Consumers

| File | Usage |
|------|-------|
| `app/(public)/cart/page.client.tsx` | Cart page — display items, update quantities, remove items |
| `app/(public)/checkout/page.client.tsx` | Checkout — read items for order summary, clear cart after order |
| `components/layout/Navbar.tsx` | Cart badge count |
| `components/home/PopularPicks.tsx` | "Add to Cart" button |

## Standard React Hooks Used Throughout

| Hook | Usage Locations |
|------|-----------------|
| `useState` | Every client component (form state, UI state, loading flags) |
| `useEffect` | Auth state detection (Navbar, Admin layout, Account page), cart sync (CartProvider), Buy Now detection (Checkout) |
| `useCallback` | Cart context methods (addItem, removeItem, etc.) to prevent re-render cascades |
| `useRef` | Intersection observer triggers (Hero, PopularPicks, FeaturesRibbon), cart skip-first-render flag |
| `useRouter` | Navigation after order placement, "Learn More" buttons |
| `usePathname` | Navbar active link detection |
| `useSearchParams` | Order ID extraction in success/payment-result pages |
| `useMemo` | Cart subtotal and itemCount derivation |

## Third-Party Hooks

| Hook | Source | Usage |
|------|--------|-------|
| `useMap` | `react-leaflet` | Access Leaflet map instance (LocationPickerMap) |
| `useMapEvents` | `react-leaflet` | Register map click events (LocationPickerMap) |
| `useInView` | `framer-motion` | Scroll-triggered animation visibility (PopularPicks, Testimonials) |

## Observations

1. **No extracted custom hooks** — All side effects and stateful logic is co-located with components. This is fine for a project of this size but could benefit from extraction as complexity grows.
2. **`react-hook-form` is installed but unused** — All forms use raw `useState` instead. The checkout form, login, register, contact, and admin product forms all manage their own state manually.
3. **No `useDebounce` or `useMediaQuery`** — The FAQ search filter on the `/faqs` page likely filters on each keystroke without debouncing.
