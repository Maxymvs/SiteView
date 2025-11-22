# AGENTS.md - Landing Page

## Package Identity

**Purpose**: Marketing landing page with hero, features, pricing, testimonials, and footer  
**Tech**: Next.js 15 App Router with route groups, Tailwind v4, Framer Motion, custom animations

---

## Setup & Run

```bash
# Development server (from root)
bun run dev

# Visit landing page
# http://localhost:3000/

# Build for production
bun run build
```

---

## Patterns & Conventions

### File Organization
- **Route group**: `(landing)` - parentheses prevent folder from affecting URL structure
- **Page component**: `page.tsx` - imports and composes all section components
- **Section components**: Individual files for each landing section (`hero-section.tsx`, `features-one.tsx`, etc.)
- **Shared header**: `header.tsx` - navigation for landing page only (different from dashboard header)

### Component Structure Pattern
All landing sections follow this pattern:

```tsx
// ✅ DO: Follow this structure
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
// ... other imports

export default function SectionName() {
    return (
        <section className="...">
            {/* Section content */}
        </section>
    )
}
```

### Styling Conventions
- ✅ **DO**: Use Tailwind utility classes for all styling
- ✅ **DO**: Use responsive prefixes: `sm:`, `md:`, `lg:` for breakpoints
- ✅ **DO**: Use semantic spacing: `py-20 md:py-36` for consistent vertical rhythm
- ✅ **DO**: Use `text-balance` for headings to prevent orphans
- ✅ **DO**: Use `text-muted-foreground` for secondary text
- ✅ **DO**: Use `max-w-*` utilities for content width constraints
- ❌ **DON'T**: Add custom CSS classes, use Tailwind utilities
- ❌ **DON'T**: Hardcode colors, use theme variables

### Component Library Usage
```tsx
// ✅ DO: Import from @/components/ui for shadcn/ui components
import { Button } from '@/components/ui/button'

// ✅ DO: Use button variants
<Button variant="outline" size="lg">...</Button>

// ✅ DO: Use asChild for Link composition
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

### Animation Patterns
```tsx
// ✅ DO: Use custom animation components from react-bits
import AnimatedListCustom from '@/app/(landing)/animated-list-custom'

// ✅ DO: Use Framer Motion for custom animations
import { motion } from 'framer-motion'

// ✅ DO: Use motion-primitives for advanced effects
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur'
```

---

## Touch Points / Key Files

### Main Files
- **Page entry**: `page.tsx` - Composes all landing sections
- **Hero**: `hero-section.tsx` - Main hero with CTA buttons
- **Navigation**: `header.tsx` - Landing page header/nav
- **Footer**: `footer.tsx` - Site footer with links

### Section Components
- **Features**: `features-one.tsx` - Product features showcase
- **Pricing**: Reference Clerk pricing component (see dashboard)
- **Testimonials**: `testimonials.tsx` - Social proof section
- **FAQ**: `faqs.tsx` - Frequently asked questions
- **CTA**: `call-to-action.tsx` - Conversion section
- **Tables**: `table.tsx` - Feature comparison tables
- **Architecture**: `cpu-architecture.tsx` - Technical diagram example

### Animation Components
- **Animated list**: `animated-list-custom.tsx` - Custom notification-style list
- **Splash cursor**: Used in 404 page (`@/components/react-bits/splash-cursor`)

---

## JIT Index Hints

```bash
# Find all landing sections
ls app/\(landing\)/*.tsx

# Find specific section
rg -n "export default function.*Section" app/\(landing\)/

# Find Button usage
rg -n "from \"@/components/ui/button\"" app/\(landing\)/

# Find all Links (for navigation audit)
rg -n "<Link href=" app/\(landing\)/ --type tsx

# Find animation usage
rg -n "framer-motion|motion-primitives|react-bits" app/\(landing\)/

# Find all imports from a section
rg -n "^import" app/\(landing\)/hero-section.tsx
```

---

## Common Gotchas

- **Route groups**: `(landing)` folder doesn't affect URL - `/` still maps to this page
- **Header component**: Don't confuse with `app/dashboard/site-header.tsx` - they're different
- **Image optimization**: Always use `next/image` with proper `width`, `height`, and `alt`
- **Link prefetching**: Next.js `<Link>` prefetches by default, use `prefetch={false}` if needed
- **Responsive design**: Mobile-first - start with mobile classes, add breakpoints with `md:`, `lg:`

---

## Examples to Follow

### Hero Section with CTA Buttons
**File**: `hero-section.tsx`
- Badge component pattern with Lucide icons
- Two-button CTA layout (primary + outline)
- Responsive typography scaling
- Image with proper Next.js optimization

### Feature Showcase
**File**: `features-one.tsx`
- Grid layout with responsive columns
- Icon integration (Lucide React)
- Balanced text layout

### Footer with Navigation
**File**: `footer.tsx`
- Multi-column footer layout
- Logo usage pattern
- Link organization

---

## Pre-PR Checks

```bash
# Lint
bun run lint

# Build (checks for import/export errors)
bun run build

# Visual check
# Start dev server and verify:
# - All sections render correctly
# - Responsive design works on mobile/tablet/desktop
# - Links navigate correctly
# - Dark/light theme works
```

---

## Design System Integration

- **Colors**: Use CSS variables from `app/globals.css` (e.g., `bg-background`, `text-foreground`)
- **Spacing**: Follow Tailwind spacing scale (4, 6, 8, 12, 16, 20, 24...)
- **Typography**: Use `text-4xl`, `text-5xl` for headings, `text-xl` for subheadings
- **Shadows**: Use `shadow-xs`, `shadow-md` from Tailwind config
- **Borders**: Use `border-border` for consistent border colors
- **Radius**: Use `rounded-md`, `rounded-lg` for consistent border radius
