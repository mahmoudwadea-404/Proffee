# 16 — Dependencies

## Production Dependencies

| Package | Version | Purpose | Used? | Alternative |
|---------|---------|---------|-------|-------------|
| `next` | 16.2.9 | React framework (App Router, SSR, routing, builds) | ✅ Core | Remix, Astro |
| `react` | 19.2.4 | UI library | ✅ Core | — |
| `react-dom` | 19.2.4 | React DOM renderer | ✅ Core | — |
| `@prisma/client` | ^6.19.3 | Database ORM client | ✅ Core | Drizzle, TypeORM, raw pg |
| `prisma` | ^6.19.3 | Prisma CLI and schema tools | ✅ Dev tool | — |
| `@supabase/ssr` | ^0.12.0 | Supabase SSR session management | ✅ Core | NextAuth, Clerk |
| `@supabase/supabase-js` | ^2.108.2 | Supabase client SDK | ✅ Core | — |
| `framer-motion` | ^12.40.0 | Animation library | ✅ Heavy use | React Spring, CSS animations |
| `lucide-react` | ^1.20.0 | Icon library | ✅ Heavy use | Heroicons, React Icons |
| `leaflet` | ^1.9.4 | Map library (OpenStreetMap) | ✅ Checkout | Google Maps JS API |
| `react-leaflet` | ^5.0.0 | React wrapper for Leaflet | ✅ Checkout | — |
| `@types/leaflet` | ^1.9.21 | TypeScript types for Leaflet | ✅ Dev | — |
| `zod` | ^4.4.3 | Schema validation | ✅ Auth forms | Yup, Valibot |
| `react-hook-form` | ^7.79.0 | Form state management | ❌ **UNUSED** | — |
| `@hookform/resolvers` | ^5.4.0 | Zod resolver for react-hook-form | ❌ **UNUSED** | — |
| `sonner` | ^2.0.7 | Toast notifications | ⚠️ Toaster only | React Hot Toast, React Toastify |
| `clsx` | ^2.1.1 | Conditional classNames | ⚠️ Minimal use | `template literals` |
| `tailwind-merge` | ^3.6.0 | Deduplicate Tailwind classes | ⚠️ Minimal use | — |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5 | TypeScript compiler |
| `tailwindcss` | ^4 | CSS framework |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin for Tailwind v4 |
| `eslint` | ^9 | JavaScript linter |
| `eslint-config-next` | 16.2.9 | Next.js ESLint rules |
| `@types/node` | ^20 | Node.js type definitions |
| `@types/react` | ^19 | React type definitions |
| `@types/react-dom` | ^19 | React DOM type definitions |
| `tsx` | ^4.22.4 | TypeScript execution (for seed script) |

## Unused Packages

| Package | Status | Recommendation |
|---------|--------|----------------|
| `react-hook-form` | Installed but **never imported** | Remove or adopt for form handling |
| `@hookform/resolvers` | Installed but **never imported** | Remove (only needed with react-hook-form) |
| `sonner` | `<Toaster />` in root layout but **no toast calls** found in components | Verify usage or remove |
| `clsx` | Installed but **no imports found** in the codebase | Remove or start using |
| `tailwind-merge` | Installed but **no imports found** in the codebase | Remove or start using (useful with clsx via `cn()` utility) |

## Bundle Impact of Unused Packages

| Package | Approximate Size (gzipped) | Can Remove? |
|---------|---------------------------|-------------|
| `react-hook-form` | ~10KB | Yes |
| `@hookform/resolvers` | ~2KB | Yes |
| `sonner` | ~8KB | Verify first |
| `clsx` | ~0.5KB | Yes |
| `tailwind-merge` | ~5KB | Yes |

**Total removable: ~25KB gzipped**

## Version Notes

| Package | Note |
|---------|------|
| `next` 16.2.9 | Very recent — uses Turbopack, has breaking changes from v14/15 (noted in `AGENTS.md`) |
| `react` 19.2.4 | Latest React 19 — supports Server Components, Actions |
| `tailwindcss` 4 | CSS-based config — no `tailwind.config.js`, uses `@theme` in CSS |
| `zod` 4 | Major version — different API from v3 (no `z.infer` changes but import paths may differ) |
| `prisma` 6.19 | Latest v6 — deprecation warnings for v7 config format |

## Recommendations

1. **Remove `react-hook-form` + `@hookform/resolvers`** if not planning to adopt, OR **adopt them** for form handling (they're already installed)
2. **Remove `clsx` and `tailwind-merge`** or create a `cn()` utility and use them consistently
3. **Audit `sonner`** — check if toast notifications are actually triggered anywhere
4. **Consider replacing `framer-motion`** with CSS animations for simple animations (scroll reveals, hover effects) to reduce bundle size
5. **Pin `prisma`** to avoid unexpected upgrades (currently `^6.19.3` allows minor bumps)
