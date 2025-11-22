# AGENTS.md - Components

## Package Identity

**Purpose**: Reusable UI component library based on shadcn/ui + custom components  
**Tech**: Radix UI primitives, Tailwind CSS v4, CVA (class-variance-authority), React 19

---

## Setup & Run

```bash
# Components are used across the app, test by running:
bun run dev

# Add new shadcn/ui component
bunx shadcn@latest add <component-name>
```

---

## Patterns & Conventions

### Component Organization

```
components/
├── ui/                          # shadcn/ui components (Radix UI + Tailwind)
│   ├── button.tsx              # ✅ Example: Button with variants
│   ├── card.tsx                # ✅ Example: Composable Card components
│   ├── sidebar.tsx             # Complex multi-part component
│   └── ...
├── kokonutui/                   # Third-party: Kokonut UI components
├── magicui/                     # Third-party: Magic UI components
├── motion-primitives/           # Third-party: Motion animation components
├── react-bits/                  # Third-party: React Bits components
├── logo.tsx                     # Custom: App logo component
├── mode-toggle.tsx              # Custom: Theme switcher
├── theme-provider.tsx           # Custom: Theme context provider
├── ConvexClientProvider.tsx     # Custom: Convex wrapper
└── custom-clerk-pricing.tsx     # Custom: Clerk pricing integration
```

### shadcn/ui Component Pattern

All `components/ui/` components follow this structure:

**Reference**: `button.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 1. Define variants with CVA
const buttonVariants = cva(
  "base-classes-here",  // Base classes applied to all variants
  {
    variants: {
      variant: {
        default: "variant-specific-classes",
        destructive: "...",
        outline: "...",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// 2. Component with variant props
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean  // Slot composition pattern
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"  // For styling hooks
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

### Component Composition Pattern

**Reference**: `card.tsx`

```tsx
// ✅ DO: Export multiple composable parts
export {
  Card,           // Container
  CardHeader,     // Header section
  CardTitle,      // Title text
  CardDescription,// Subtitle text
  CardContent,    // Main content
  CardFooter,     // Footer section
  CardAction,     // Action buttons
}

// Usage:
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
    <CardAction><Button>Action</CardAction>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer here</CardFooter>
</Card>
```

### Styling Utilities

**Reference**: `lib/utils.ts`

```tsx
// ✅ ALWAYS use cn() for className merging
import { cn } from "@/lib/utils"

// ✅ DO: Merge classes properly
<div className={cn("base-classes", className)} />

// ✅ DO: Conditional classes
<div className={cn("base", isActive && "active-classes")} />

// ❌ DON'T: Concatenate strings directly
<div className={`base-classes ${className}`} />  // Wrong!
```

### Variant Props Pattern

```tsx
// ✅ DO: Use VariantProps for type-safe variants
import { type VariantProps } from "class-variance-authority"

const variants = cva("base", {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { sm: "...", lg: "..." },
  },
})

type Props = VariantProps<typeof variants> & {
  // other props
}
```

### Slot Composition (asChild Pattern)

```tsx
// ✅ DO: Support asChild for composition
import { Slot } from "@radix-ui/react-slot"

function Button({ asChild, ...props }) {
  const Comp = asChild ? Slot : "button"
  return <Comp {...props} />
}

// Usage: Renders a Link styled as a Button
<Button asChild>
  <Link href="/somewhere">Click me</Link>
</Button>
```

---

## Touch Points / Key Files

### Core UI Components (shadcn/ui)
- **Button**: `ui/button.tsx` - Primary button with variants
- **Card**: `ui/card.tsx` - Container with header/content/footer
- **Input**: `ui/input.tsx` - Form input field
- **Label**: `ui/label.tsx` - Form label
- **Select**: `ui/select.tsx` - Dropdown select (Radix UI)
- **Checkbox**: `ui/checkbox.tsx` - Checkbox input
- **Switch**: `ui/switch.tsx` - Toggle switch
- **Dialog**: `ui/drawer.tsx`, `ui/sheet.tsx` - Modal dialogs
- **Dropdown**: `ui/dropdown-menu.tsx` - Context menus
- **Table**: `ui/table.tsx` - Data table components
- **Tabs**: `ui/tabs.tsx` - Tab navigation
- **Badge**: `ui/badge.tsx` - Status badges
- **Avatar**: `ui/avatar.tsx` - User avatars
- **Tooltip**: `ui/tooltip.tsx` - Hover tooltips
- **Sidebar**: `ui/sidebar.tsx` - Collapsible sidebar (complex component)

### Chart Components
- **Chart utilities**: `ui/chart.tsx` - Recharts wrapper with theme integration

### Custom Components
- **Logo**: `logo.tsx` - App logo with variants
- **Theme toggle**: `mode-toggle.tsx` - Dark/light mode switcher using Switch
- **Theme provider**: `theme-provider.tsx` - Wraps next-themes
- **Convex provider**: `ConvexClientProvider.tsx` - Wraps Convex client
- **Clerk pricing**: `custom-clerk-pricing.tsx` - Custom pricing table component

### Third-Party Components
- **Kokonut UI**: `kokonutui/attract-button.tsx` - Animated button
- **Magic UI**: `magicui/pulsating-button.tsx` - Pulsating effect button
- **Motion Primitives**: `motion-primitives/progressive-blur.tsx`, `motion-primitives/infinite-slider.tsx`
- **React Bits**: `react-bits/splash-cursor.tsx` - Interactive cursor effect

### Utilities
- **cn helper**: `lib/utils.ts` - Tailwind class merging (clsx + tailwind-merge)

---

## JIT Index Hints

```bash
# List all UI components
ls components/ui/*.tsx

# Find component exports
rg -n "^export.*function" components/ui/

# Find variant definitions
rg -n "cva\(" components/ui/ --type tsx

# Find Radix UI usage
rg -n "@radix-ui" components/ui/

# Find all Button usage in app
rg -n 'from "@/components/ui/button"' app/

# Find all Card usage
rg -n 'from "@/components/ui/card"' app/

# Find components using cn utility
rg -n 'cn\(' components/ --type tsx

# Find all custom components (non-ui)
ls components/*.tsx
```

---

## Common Gotchas

- **cn() is required**: Always use `cn()` from `@/lib/utils` for className merging, never concatenate strings
- **Radix UI imports**: Components use Radix UI primitives - don't modify the Radix imports
- **Variant defaults**: CVA requires `defaultVariants` - always provide them
- **data-slot attribute**: Used for styling hooks, keep them in components
- **TypeScript props**: Extend `React.ComponentProps<"element">` for proper HTML attributes
- **asChild pattern**: When using `asChild`, the child must be a single element (use fragments carefully)
- **Theme variables**: Use CSS variables like `bg-background`, `text-foreground` - don't hardcode colors

---

## Examples to Follow

### Creating a New shadcn/ui Component

**Use shadcn CLI**:
```bash
# Add a pre-built component
bunx shadcn@latest add dialog

# Or manually create following the button pattern
```

### Creating a Custom Component

```tsx
// ✅ DO: Follow this pattern
import * as React from "react"
import { cn } from "@/lib/utils"

interface MyComponentProps extends React.ComponentProps<"div"> {
  customProp?: string
}

export function MyComponent({ 
  className, 
  customProp,
  ...props 
}: MyComponentProps) {
  return (
    <div 
      className={cn("base-styles", className)} 
      {...props}
    >
      {/* component content */}
    </div>
  )
}
```

### Button Variants Example
**Reference**: `ui/button.tsx`

```tsx
// Usage examples:
<Button>Default Button</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

### Card Composition Example
**Reference**: `ui/card.tsx`

```tsx
// ✅ DO: Compose Card components
<Card>
  <CardHeader>
    <CardTitle>Revenue</CardTitle>
    <CardDescription>Monthly revenue overview</CardDescription>
    <CardAction>
      <Button variant="outline" size="sm">View</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">$12,345</p>
  </CardContent>
  <CardFooter>
    <p className="text-sm text-muted-foreground">+12% from last month</p>
  </CardFooter>
</Card>
```

### Form Pattern with Input & Label
**Reference**: `ui/input.tsx`, `ui/label.tsx`

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="you@example.com" 
  />
</div>
```

---

## Styling Guidelines

### Theme Colors (from globals.css)
```css
/* ✅ DO: Use semantic color classes */
bg-background           /* Main background */
bg-foreground          /* Main text on background */
bg-card                /* Card background */
bg-primary             /* Primary brand color */
bg-secondary           /* Secondary color */
bg-muted               /* Muted background */
bg-accent              /* Accent color */
bg-destructive         /* Error/danger color */

text-foreground        /* Default text */
text-muted-foreground  /* Secondary text */
text-primary-foreground /* Text on primary bg */

border-border          /* Default border color */
border-input           /* Input border color */
```

### Spacing & Sizing
```tsx
// ✅ DO: Use Tailwind spacing scale
gap-2, gap-4, gap-6    // Consistent gaps
p-4, px-6, py-4        // Padding
h-9, h-10              // Heights (match button sizes)
rounded-md, rounded-lg // Border radius
shadow-xs, shadow-md   // Shadows
```

### Responsive Design
```tsx
// ✅ DO: Mobile-first with breakpoints
className="text-sm md:text-base lg:text-lg"
className="px-4 md:px-6 lg:px-8"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## Adding New Components

### Via shadcn CLI (Recommended)
```bash
# View available components
bunx shadcn@latest add

# Add specific component
bunx shadcn@latest add alert-dialog
bunx shadcn@latest add dropdown-menu
bunx shadcn@latest add toast
```

### Manual Addition
1. Copy pattern from existing component (e.g., `button.tsx`)
2. Use CVA for variants if needed
3. Extend proper HTML element props
4. Use `cn()` for className merging
5. Add `data-slot` attribute for styling hooks
6. Export both component and variants (if using CVA)

---

## Pre-PR Checks

```bash
# Lint
bun run lint

# Type check
bunx tsc --noEmit

# Build (checks for import errors)
bun run build

# Visual checks:
# 1. Component renders in light & dark mode
# 2. All variants work correctly
# 3. Responsive design works
# 4. No TypeScript errors in IDE
# 5. Proper prop types (autocomplete works)
# 6. Accessible (keyboard navigation, ARIA attributes)
```

---

## Accessibility Notes

- **Radix UI primitives**: Pre-built with accessibility (keyboard nav, ARIA attributes)
- **Form controls**: Always pair `<Input>` with `<Label>` using `htmlFor` and `id`
- **Interactive elements**: Use semantic HTML (`<button>`, `<a>`, etc.)
- **Focus styles**: Tailwind focus-visible utilities are pre-configured
- **Color contrast**: Theme colors meet WCAG standards

---

## Component Library Documentation

- **shadcn/ui docs**: https://ui.shadcn.com/
- **Radix UI docs**: https://www.radix-ui.com/
- **CVA docs**: https://cva.style/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
