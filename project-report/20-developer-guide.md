# 20 — Developer Guide

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** (project uses `package-lock.json`)
- **PostgreSQL** database (or Supabase account)
- **Supabase** project (for auth)
- **Paymob** merchant account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/mahmoudwadea-404/Proffee.git
cd proffee-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env   # NOTE: .env.example does NOT exist — create .env manually (see below)

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Database (PostgreSQL via Supabase)
DATABASE_URL="postgresql://postgres:password@host:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Paymob (Payment Gateway)
PAYMOB_SECRET_KEY="egy_sk_test_..."
PAYMOB_INTEGRATION_ID="your-integration-id"
PAYMOB_HMAC_SECRET="your-hmac-secret"
PAYMOB_PUBLIC_KEY="egy_pk_test_..."

# Base URL (for Paymob callbacks)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

**Required variables:** `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYMOB_SECRET_KEY`, `PAYMOB_INTEGRATION_ID`, `PAYMOB_HMAC_SECRET`, `PAYMOB_PUBLIC_KEY`

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start Next.js dev server (Turbopack) |
| Build | `npm run build` | Production build |
| Start | `npm run start` | Start production server |
| Lint | `npm run lint` | Run ESLint |
| Seed | `npx tsx prisma/seed.ts` | Seed database with 8 products |
| DB Push | `npx prisma db push` | Sync schema to database |
| DB Studio | `npx prisma studio` | Open Prisma Studio (database GUI) |
| Type Check | `npx tsc --noEmit` | TypeScript type checking without emit |

## Project Structure

```
proffee-v2/
├── app/              # Pages, layouts, API routes (Next.js App Router)
├── actions/          # Server Actions (mutations)
├── components/       # Reusable React components
├── lib/              # Shared utilities, context, services
├── types/            # TypeScript types and Zod schemas
├── prisma/           # Database schema and seed
├── public/           # Static assets (images)
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

## Coding Conventions

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Pages | `page.tsx` (server) + `page.client.tsx` (client) | `app/(public)/cart/page.tsx` |
| Components | PascalCase | `components/home/Hero.tsx` |
| Actions | camelCase | `actions/orders.ts` |
| Lib | camelCase | `lib/prisma.ts` |
| Types | camelCase | `types/auth.ts` |
| CSS | kebab-case | `globals.css` |

### Component Pattern

Every page follows the **server/client split** pattern:

```tsx
// page.tsx — thin server wrapper
import ClientComponent from "./page.client"

export const metadata = { title: "Page Title" }

export default function Page() {
  return <ClientComponent />
}
```

```tsx
// page.client.tsx — all interactive UI
"use client"
// ... component with useState, useEffect, event handlers
```

### Styling

- **Tailwind CSS v4** — CSS-based config in `globals.css`
- **Custom tokens:** `bg-background`, `bg-surface`, `border-border`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `bg-primary`, `text-primary`
- **No CSS modules** — all styles are Tailwind utility classes
- **No component library** — inline Tailwind classes everywhere

### State Management

- **Cart:** React Context (`lib/cart-context.tsx`) — `useState` + `useEffect` + `useCallback`
- **Forms:** Raw `useState` for form fields (no react-hook-form despite it being installed)
- **UI state:** Component-local `useState`
- **Auth:** Supabase client-side session

### Server Actions

All mutations use `"use server"` functions:

```typescript
"use server"

export async function myAction(input: MyInput) {
  // Prisma queries
  // Return { success: true, data } or { success: false, error }
}
```

**Convention:** Return `{ success: boolean, error?: string, ...data }` from all actions.

### Validation

- **Auth forms:** Zod schemas in `types/auth.ts`
- **Checkout:** Manual `required` + `isValid` boolean check
- **Server actions:** No validation (client input trusted)

## Build Process

### Development
```bash
npm run dev    # Next.js dev server with Turbopack (fast HMR)
```

### Production Build
```bash
npm run build  # TypeScript check → compile → static page generation
npm run start # Start production server on port 3000
```

### Build Output
- TypeScript compilation
- Static page generation (27 pages)
- Server-side rendering configuration
- Bundle optimization via Turbopack

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Vercel auto-detects Next.js and deploys
4. Paymob webhooks need `NEXT_PUBLIC_BASE_URL` set to the Vercel domain

### Manual Deployment

```bash
npm run build
npm run start  # Runs on port 3000
```

### Database Migrations

The project uses `npx prisma db push` (not `prisma migrate dev`):

```bash
# After schema changes:
npx prisma db push

# This syncs the schema without creating migration files
# WARNING: Not recommended for production — use prisma migrate for production
```

## Common Tasks

### Adding a New Page

1. Create `app/(public)/new-page/page.tsx`:
```tsx
import ClientComponent from "./page.client"
export const metadata = { title: "New Page | Proffee" }
export default function Page() { return <ClientComponent /> }
```

2. Create `app/(public)/new-page/page.client.tsx`:
```tsx
"use client"
export default function NewPage() { return <div>...</div> }
```

3. It automatically gets Navbar + Footer via `(public)/layout.tsx`

### Adding a New Server Action

1. Create or edit file in `actions/`:
```typescript
"use server"
import { prisma } from "@/lib/prisma"

export async function myNewAction(input: { ... }) {
  try {
    const result = await prisma.model.create({ data: input })
    return { success: true, data: result }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to ..." }
  }
}
```

2. Import and call from client components:
```tsx
import { myNewAction } from "@/actions/my-file"
const result = await myNewAction({ ... })
```

### Running Scripts

```bash
# Cleanup stale orders
npx tsx scripts/cleanup-stale-orders.ts

# Seed database
npx tsx prisma/seed.ts

# Setup Supabase storage (run in Supabase SQL editor)
# Copy contents of scripts/setup-storage.sql
```

## Debugging

### Common Issues

1. **Prisma client not found:** Run `npx prisma generate`
2. **Database connection error:** Check `DATABASE_URL` in `.env`
3. **Supabase auth error:** Check `NEXT_PUBLIC_SUPABASE_URL` and keys
4. **Paymob error:** Check all 4 Paymob env vars are set
5. **Map not loading:** Ensure Leaflet CSS is imported (it is in `LocationPickerMap.tsx`)
6. **Marker icons broken:** The project uses unpkg CDN URLs for Leaflet icons (see `LocationPickerMap.tsx`)

### Debug Logging

The project has extensive `console.log` in:
- `actions/orders.ts` (order creation flow)
- `app/api/webhooks/paymob/route.ts` (webhook processing)
- `lib/prisma.ts` (database connection info)

Filter in browser DevTools: `[Checkout]`, `[Paymob Webhook]`, `[createCardOrder]`

### TypeScript Check

```bash
npx tsc --noEmit    # Check for type errors without building
```

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| App Router (not Pages Router) | Next.js 16 default, Server Components, React 19 features |
| Server Actions (not REST API) | Simpler mutations, no API route boilerplate |
| Supabase Auth (not NextAuth) | Supabase ecosystem integration, simpler setup |
| Prisma (not Drizzle) | Mature ORM, good Next.js integration, schema-first |
| Tailwind CSS v4 (not v3) | CSS-based config, no JS config file needed |
| Cart in Context (not Zustand) | Simple enough for current scale, no extra dependency |
| Guest checkout via user upsert | Allows order tracking without mandatory registration |
| Paymob Intention API | Modern Paymob flow with better security (HMAC verification) |
