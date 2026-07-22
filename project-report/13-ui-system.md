# 13 — UI System

## Design System

The project uses a **custom dark coffee-shop theme** built on Tailwind CSS v4 with CSS-based configuration (no `tailwind.config.js`).

## Theme Tokens (`app/globals.css`)

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `#120B06` | Page background (very dark brown) |
| `--color-surface` | `#1A100A` | Card/panel backgrounds |
| `--color-surface-2` | `#22150F` | Hover states, alternate surfaces |
| `--color-border` | `#3A2A1A` | All borders |
| `--color-primary` | `#A66C46` | Main accent (copper/bronze) |
| `--color-primary-dark` | `#8B5A3A` | Button hover states |
| `--color-primary-light` | `#C4885E` | Light accent |
| `--color-text-primary` | `#FFFFFF` | Main text |
| `--color-text-secondary` | `#D4C3B3` | Secondary text |
| `--color-text-muted` | `#8A7A6A` | Muted/placeholder text |

### Typography

| Token | Font | Usage |
|-------|------|-------|
| `--font-serif` | Playfair Display | Headings, product names, section titles |
| `--font-sans` | Inter | Body text, labels, UI elements |
| `--font-script` | Great Vibes | Decorative text ("Rich. Smooth. Perfect.") |

### Tailwind Usage

```css
/* Applied via @theme directive */
@theme {
  --font-serif: var(--font-playfair);
  --font-sans: var(--font-inter);
  --font-script: var(--font-great-vibes);
}
```

## Component Patterns

### Input Pattern
```
w-full px-4 py-3 rounded-xl bg-background border border-border
text-text-primary placeholder:text-text-muted text-sm
focus:outline-none focus:border-primary transition-colors duration-300
```

### Label Pattern
```
text-xs font-medium text-text-secondary uppercase tracking-wider
```

### Card/Section Pattern
```
rounded-2xl border border-border bg-surface p-6 space-y-5
```

### Primary Button Pattern
```
w-full py-4 rounded-xl bg-primary text-white font-semibold text-sm
hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed
transition-all duration-300
```

### Secondary Button Pattern
```
inline-flex items-center gap-2 px-8 py-4 rounded-xl
border border-primary/40 text-primary font-semibold text-sm
hover:bg-primary/10 transition-all duration-300
```

### Error Pattern
```
text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-2 text-center
```

## Icons

| Library | Import | Usage |
|---------|--------|-------|
| `lucide-react` | Individual icons | All icons throughout the app |

Commonly used icons: `ArrowLeft`, `ArrowRight`, `Coffee`, `CreditCard`, `Loader2`, `MapPin`, `Menu`, `X`, `Package`, `ShoppingBag`, `ShoppingCart`, `Star`, `ChevronDown`, `ChevronLeft`, `ChevronRight`, `CheckCircle`, `Shield`, `Heart`, `Mail`, `Phone`, `User`, `LogOut`, `ShieldCheck`, `Flame`, `Gift`, `Truck`, `LayoutDashboard`, `Search`, `Filter`

## Layout Strategy

### Responsive Breakpoints (Tailwind defaults)

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Side-by-side form fields (2-col grid) |
| `md` | 768px | Text scaling, multi-column layouts |
| `lg` | 1024px | Main content grid (3+2 columns for checkout) |

### Page Width
```
max-w-6xl mx-auto px-6
```

### Grid System
- **Checkout:** `grid grid-cols-1 lg:grid-cols-5 gap-10` (3 cols form + 2 cols summary)
- **Product listing:** Responsive grid with cards
- **Admin:** Full-width tables with overflow-x-auto

## Animation

| Library | Usage |
|---------|-------|
| `framer-motion` | Page transitions, scroll reveals, accordion expand, carousel slide, modal open/close |

### Common Animation Patterns

```tsx
// Scroll reveal
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

// Staggered children (delay increments per item)
transition={{ duration: 0.4, delay: index * 0.1 }}

// Carousel slide
<motion.div key={current} initial={{ x: direction * 300, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }} exit={{ x: direction * -300, opacity: 0 }}>

// Modal
<motion.div initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}>
```

## Responsive Strategy

1. **Mobile-first** — Default styles are mobile, `sm:` and `lg:` add complexity
2. **Hamburger menu** — Navbar collapses to animated slide-in menu on mobile
3. **Stacked columns** — Checkout, footer, and product grids stack vertically on mobile
4. **Horizontal scroll** — PopularPicks product cards scroll horizontally on all sizes
5. **No explicit breakpoints** beyond Tailwind defaults — no custom media queries

## Dark Theme

The entire application is **dark-theme only**. There is no light mode toggle. The dark coffee-shop aesthetic is consistent across all pages:

- Dark background (`#120B06`)
- Slightly lighter surface cards (`#1A100A`)
- Warm copper accents (`#A66C46`)
- White/cream text on dark backgrounds
- Subtle decorative gradient blurs (`bg-primary/5 rounded-full blur-3xl`)

## Observations

1. **No design token abstraction** — Token names are Tailwind utilities, not a design system (no spacing scale, no shadow tokens, no radius tokens beyond Tailwind defaults)
2. **No shared button/input components** — Same CSS classes are copy-pasted across every page
3. **No Storybook or component library** — Components are not documented or isolated
4. **Consistent styling** — Despite no shared components, the copy-paste approach maintains visual consistency
5. **Framer Motion is heavy** — Used on every page but could be selectively loaded
