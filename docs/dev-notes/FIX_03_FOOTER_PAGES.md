# FIX-03: Footer Pages (FAQs, Shipping, Returns, Terms, Privacy)

## Problem
Footer links pointed to `/faqs`, `/shipping`, `/returns`, `/terms`, `/privacy` — all resulted in 404.

## Solution
Created 5 route pairs under `app/(public)/` matching the existing `about` page pattern:

| Route | Files | Content |
|---|---|---|
| `/faqs` | `page.tsx` + `page.client.tsx` | 32 accordion questions across 8 categories (ordering, shipping, returns, products, payment, account, subscription) with search and category filter |
| `/shipping` | `page.tsx` + `page.client.tsx` | Coverage (all Egypt), COD + online payment, free shipping at EGP 500, delivery timelines (2-5 / 3-7 business days), placeholder for shipping partners |
| `/returns` | `page.tsx` + `page.client.tsx` | No change-of-mind returns, 48-hour claims window, replacement/refund process, refund timelines by payment method |
| `/terms` | `page.tsx` + `page.client.tsx` | 7 standard sections (General, Use of Website, Orders, Accounts, Prohibited Activities, Liability, IP) with legal disclaimer |
| `/privacy` | `page.tsx` + `page.client.tsx` | 7 sections (Data Collected, Usage, Cookies, Storage/Security, User Rights, Contact, Retention) covering Supabase/Prisma usage |

## Patterns Followed
- Server component (`page.tsx`) exports `Metadata` + renders client component
- Client component (`page.client.tsx`) uses `framer-motion`, `lucide-react`, and existing color tokens (`bg-background`, `text-primary`, `font-script`, etc.)
- Hero section with gradient blobs, script heading, serif title, description
- Legal pages (terms, privacy) include amber disclaimer box + `{/* TODO: Review with legal counsel */}`
- Returns page includes `{/* TODO: Review with business owner */}`
- Shipping page uses `{/* TODO: Replace with actual shipping partners */}` placeholder

## Verification
- `npx tsc --noEmit`: zero source errors (only pre-existing `.next/` build cache noise)
- All 5 links in `Footer.tsx` now resolve to valid routes
