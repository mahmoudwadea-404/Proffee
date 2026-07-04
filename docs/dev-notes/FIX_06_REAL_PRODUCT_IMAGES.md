# FIX-06: Replace Placeholder Products with Real Product Images

## Summary
Replaced 8 old placeholder seed products (Ethiopia Yirgacheffe, Colombia Supreme, etc.) with 8 real products matching actual inventory, using photos from the `Photos/` folder. Also replaced the Hero section's decorative emoji with the Proffee Gold branding image.

## Changes

### Files copied
| Source | Destination |
|--------|-------------|
| `Photos/plain-light-roast.jpg` | `public/images/products/plain-light-roast.jpg` |
| `Photos/plain-medium-roast.jpg` | `public/images/products/plain-medium-roast.jpg` |
| `Photos/plain-dark-roast.jpg` | `public/images/products/plain-dark-roast.jpg` |
| `Photos/mahwaj-light-roast.jpg` | `public/images/products/mahwaj-light-roast.jpg` |
| `Photos/mahwaj-medium-roast.jpg` | `public/images/products/mahwaj-medium-roast.jpg` |
| `Photos/mahwaj-dark-roast.jpg` | `public/images/products/mahwaj-dark-roast.jpg` |
| `Photos/french-roast.png` | `public/images/products/french-roast.png` |
| `Photos/french-hazelnut.jpeg` | `public/images/products/french-hazelnut.jpeg` |
| `Photos/Proffee_Gold.jpeg` | `public/images/proffee-gold-hero.jpeg` |

### Files modified
- **`prisma/seed.ts`** — Completely rewritten: removed 8 old products, added 8 real products with authentic bilingual names (Arabic/English), bilingual-blend descriptions, correct local image paths, and 170–210 EGP pricing.
- **`components/home/Hero.tsx`** — Replaced coffee emoji ☕ + "Premium Coffee" placeholder with `<img src="/images/proffee-gold-hero.jpeg">` in the brand card.

### Database
- FK reference check: Zero references in OrderItem, CartItem, Review, or Wishlist — safe `deleteMany()`.
- Seed ran successfully: 8 old deleted, 8 new inserted.
- Each new product has auto-generated CUIDs (no ID reuse).

### Verification
- `npx tsc --noEmit` ✅ (no output = clean)
- `npm run build` ✅ (25 static pages, compiled 9.9s, no errors)
