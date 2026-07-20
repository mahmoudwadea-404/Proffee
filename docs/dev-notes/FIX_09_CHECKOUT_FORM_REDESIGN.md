# FIX_09: Checkout Form Redesign — Granular Shipping Fields + OpenStreetMap Location Picker

## Summary

Redesigned the checkout Shipping Address section to use granular, e-commerce-standard fields instead of a single "Full Name" + "Street Address" + "City" layout. Added an OpenStreetMap-based location picker for precise delivery coordinates. No visual theme changes — only form field structure and layout within the Shipping Address section changed.

---

## Schema Changes (`prisma/schema.prisma`)

Added the following columns to the `Order` model:

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `firstName` | `String` | `""` | Replaces single `name` field |
| `lastName` | `String` | `""` | Replaces single `name` field |
| `governorate` | `String` | `""` | Egyptian governorate (Arabic) |
| `city` | `String` | `""` | Free-text city within governorate |
| `address` | `String` | `""` | Street address (moved from JSON) |
| `latitude` | `Float?` | `null` | Optional, from map picker |
| `longitude` | `Float?` | `null` | Optional, from map picker |

**Backward compatibility:** The legacy `shippingAddress Json` column is preserved and still populated with `{ street, city, governorate }` for any code that reads it. Existing 30 rows have empty strings for the new columns (safe default).

**Migration:** Applied via `npx prisma db push` (project convention, not `prisma migrate`).

---

## New Form Fields

### Customer Information section
- **First Name** (required) + **Last Name** (required) — side-by-side, replacing single "Full Name"
- **Email** (required) — unchanged
- **Phone** (required) — unchanged

### Shipping Address section
- **Governorate** (required) — `<select>` dropdown with all 27 Egyptian governorates in Arabic script
- **City** (required) — free-text input for specific city/town within governorate
- **Street Address** (required) — text input with "Pick location on map" button below
- **Map coordinates** — displayed as monospace text below the map button when set
- **Order Notes** (optional) — unchanged

### Validation
All required fields must be non-empty for the submit button to enable (same pattern as before — raw state check, no zod).

---

## OpenStreetMap Location Picker

### Library
- `leaflet@1.9.4` + `react-leaflet@5.0.0` + `@types/leaflet`
- React 19 compatible (react-leaflet v5 supports React 19)

### Architecture
- `components/checkout/LocationPicker.tsx` — modal wrapper, uses `next/dynamic` with `{ ssr: false }` to load the map (Leaflet requires `window`)
- `components/checkout/LocationPickerMap.tsx` — the actual map component, imports react-leaflet directly

### Behavior
- Opens as a full-screen modal with dark-themed overlay (`bg-black/60`) matching the admin products modal pattern
- Map centered on Cairo (30.0444, 31.2357) by default
- User can click anywhere on the map to place a pin, or drag the existing pin
- Coordinates displayed as `{lat}, {lng}` with "Confirm Location" button
- On confirm, stores lat/lng in form state — supplements (does NOT replace) the free-text Address field

### Marker Icon Fix (Leaflet + Next.js bundler gotcha)
Leaflet's default marker icon paths break with webpack/Turbopack bundling. Fixed by explicitly setting icon URLs via:
```ts
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})
```
This is loaded from CDN (unpkg) which avoids the bundler path issue entirely.

### CSS
Leaflet's CSS is imported directly in the map component: `import "leaflet/dist/leaflet.css"`.

---

## Order Creation (`actions/orders.ts`)

Updated both `createOrder` (COD) and `createCardOrder` (Card) to:
- Accept `firstName`, `lastName`, `governorate`, `city`, `address`, optional `latitude`/`longitude` in `CreateOrderInput`
- Persist all new fields as top-level Order columns
- Still populate `shippingAddress` JSON for backward compat
- User name derived as `${firstName} ${lastName}` for the User model upsert
- Paymob billing data now receives `firstName`/`lastName` directly instead of splitting a single `name`

---

## Admin Orders View (`app/admin/orders/page.tsx`)

- Added **Shipping** column showing: customer name (`firstName lastName`), governorate + city, and truncated street address
- Updated `Order` type to include the new fields
- Search still works on `user.name` and `user.email`

---

## Theme/Styling Consistency

- All new inputs use the exact same Tailwind classes as existing inputs: `w-full px-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300`
- Labels use `text-xs font-medium text-text-secondary uppercase tracking-wider`
- Map picker modal follows the admin products modal pattern: `fixed inset-0 z-50` with `bg-black/60` backdrop + `rounded-2xl border border-border bg-background`
- Governorate `<select>` uses `appearance-none` matching other inputs
- No colors, fonts, spacing, or other visual elements outside the checkout Shipping Address section were changed

---

## Testing Notes

### Local Testing
- Map picker should open, display OpenStreetMap tiles centered on Cairo, allow pin placement via click/drag, and return coordinates on confirm
- Verify all 5 new required fields (firstName, lastName, governorate, city, address) must be filled for submit button to enable
- Test COD and Card payment flows both complete successfully with the new field structure

### Vercel Deployment
- OpenStreetMap requires **no API key** and **no domain whitelisting** — works identically in local dev and production
- The CDN-hosted marker icons (unpkg.com) are publicly accessible from any domain
- No environment variables needed for the map picker

### Dependencies Added
- `leaflet@1.9.4`
- `react-leaflet@5.0.0`
- `@types/leaflet` (dev dependency)

---

## Files Changed

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added 7 columns to Order model |
| `components/checkout/LocationPicker.tsx` | **New** — map picker modal |
| `components/checkout/LocationPickerMap.tsx` | **New** — Leaflet map component |
| `app/(public)/checkout/page.client.tsx` | Restructured form fields, integrated map picker |
| `actions/orders.ts` | Updated `CreateOrderInput` type + both order creation functions |
| `actions/admin.ts` | Cast `shippingAddress` JSON in `getOrders` |
| `app/admin/orders/page.tsx` | Added Shipping column, updated Order type |
| `package.json` | Added leaflet, react-leaflet, @types/leaflet |
