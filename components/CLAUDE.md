# Components - Reusable UI Building Blocks

**Technology**: React 19 + shadcn/ui + Tailwind CSS v4
**Entry Point**: [components/ui/](ui/) directory
**Parent Context**: This extends [../CLAUDE.md](../CLAUDE.md)

---

## Overview

The components directory contains all reusable UI components for SiteView:
- **shadcn/ui components** - Base UI primitives (buttons, cards, inputs, etc.)
- **Animation libraries** - Motion primitives, MagicUI, React Bits, Kokonut UI
- **Provider components** - Theme provider, Convex client provider
- **Custom components** - Logo, mode toggle, Clerk pricing

**Key Philosophy**: Composition over configuration. Components are built to be composed together, not heavily configured.

---

## Development Commands

### Adding shadcn/ui Components

```bash
# Add a new shadcn component
bunx shadcn@latest add <component-name>

# Examples:
bunx shadcn@latest add dialog
bunx shadcn@latest add dropdown-menu
bunx shadcn@latest add form

# List available components
bunx shadcn@latest add
```

### Working with Components

```bash
# Find component definition
rg -n "^export (function|const|default)" components/ui/<component>.tsx

# Find component usage across app
rg -n "<ComponentName" app/

# Type check components
bunx tsc --noEmit components/**/*.tsx
```

---

## Architecture

### Directory Structure

```
components/
├── ui/                          # shadcn/ui base components (25+ files)
│   ├── button.tsx              # Button component (CVA variants)
│   ├── card.tsx                # Card container
│   ├── input.tsx               # Text input
│   ├── select.tsx              # Dropdown select
│   ├── table.tsx               # Table primitives
│   ├── dialog.tsx              # Modal dialog
│   ├── dropdown-menu.tsx       # Dropdown menu
│   ├── sidebar.tsx             # Sidebar components
│   ├── tabs.tsx                # Tab navigation
│   ├── checkbox.tsx            # Checkbox input
│   ├── toggle.tsx              # Toggle button
│   ├── badge.tsx               # Badge/tag
│   ├── avatar.tsx              # User avatar
│   ├── drawer.tsx              # Bottom/side drawer
│   ├── sheet.tsx               # Slide-out panel
│   ├── tooltip.tsx             # Tooltip
│   ├── skeleton.tsx            # Loading skeleton
│   ├── label.tsx               # Form label
│   ├── breadcrumb.tsx          # Breadcrumb navigation
│   ├── separator.tsx           # Visual separator
│   ├── switch.tsx              # Toggle switch
│   ├── toggle-group.tsx        # Toggle group
│   ├── animated-group.tsx      # Animated group
│   ├── text-effect.tsx         # Text animations
│   ├── sonner.tsx              # Toast notifications
│   └── chart.tsx               # Chart wrapper (Recharts)
│
├── magicui/                     # MagicUI animation components
│   └── [various animation components]
│
├── react-bits/                  # React Bits animation library
│   └── [animation components]
│
├── kokonutui/                   # Kokonut UI components
│   └── [UI components]
│
├── motion-primitives/           # Motion Primitives animations
│   └── [animation primitives]
│
├── ConvexClientProvider.tsx     # Convex + Clerk integration provider
├── theme-provider.tsx           # Dark/light theme provider (next-themes)
├── mode-toggle.tsx              # Theme toggle button
├── logo.tsx                     # SiteView logo component
├── custom-clerk-pricing.tsx     # Clerk billing pricing table
├── AGENTS.md                    # Legacy agent guidance (consider merging)
└── CLAUDE.md                    # This file
```

---

## shadcn/ui Component Patterns

### Configuration

**File**: [../components.json](../components.json)

```json
{
  "style": "new-york",           // Component style variant
  "rsc": true,                   // React Server Components enabled
  "tsx": true,                   // TypeScript
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Component Anatomy

All shadcn components follow this pattern:

```tsx
// components/ui/button.tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// 1. Define variants with CVA
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// 2. Define component interface
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// 3. Implement component
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

**Key Pattern Elements**:
1. **CVA (class-variance-authority)** - Type-safe variants
2. **Radix UI Slot** - Allows `asChild` prop for composition
3. **cn() utility** - Merges Tailwind classes correctly
4. **forwardRef** - Allows ref forwarding for accessibility
5. **Design tokens** - Uses theme variables (`bg-primary`, not hardcoded colors)

---

## Usage Patterns

### Pattern 1: Basic Component Usage

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card content here</p>
        <Button variant="default">Click Me</Button>
      </CardContent>
    </Card>
  )
}
```

### Pattern 2: Component Composition (asChild)

Use `asChild` to compose components without wrapper divs:

```tsx
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// ❌ DON'T - Creates nested button inside Link
function Bad() {
  return (
    <Link href="/dashboard">
      <Button>Go to Dashboard</Button>
    </Link>
  )
}

// ✅ DO - Button becomes the Link (no nesting)
function Good() {
  return (
    <Button asChild>
      <Link href="/dashboard">Go to Dashboard</Link>
    </Button>
  )
}
```

### Pattern 3: Variant Usage

```tsx
import { Button } from '@/components/ui/button'

function Variants() {
  return (
    <div className="flex gap-2">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="default" size="sm">Small</Button>
      <Button variant="default" size="lg">Large</Button>
    </div>
  )
}
```

### Pattern 4: Custom Styling

Extend components with custom classes:

```tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function CustomButton() {
  return (
    <Button
      variant="outline"
      className="w-full justify-start" // Additional classes
    >
      Custom Styled Button
    </Button>
  )
}

// For complex custom styling, use cn() utility
function ComplexCustom() {
  const isActive = true

  return (
    <Button
      className={cn(
        'relative overflow-hidden',
        isActive && 'ring-2 ring-primary'
      )}
    >
      Active Button
    </Button>
  )
}
```

### Pattern 5: Dialog/Modal Pattern

```tsx
'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ModalExample() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Modal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
          <DialogDescription>
            Modal description text
          </DialogDescription>
        </DialogHeader>
        <div>
          {/* Modal content */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Pattern 6: Form Pattern

```tsx
'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function FormExample() {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitted:', name)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Pattern 7: Toast Notifications

```tsx
'use client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function ToastExample() {
  return (
    <div className="flex gap-2">
      <Button onClick={() => toast.success('Success!')}>
        Show Success
      </Button>
      <Button onClick={() => toast.error('Error occurred')}>
        Show Error
      </Button>
      <Button onClick={() => toast.info('Information')}>
        Show Info
      </Button>
    </div>
  )
}
```

**Note**: Toaster must be included in layout:

```tsx
// app/layout.tsx
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

---

## Provider Components

### Theme Provider

**File**: [theme-provider.tsx](theme-provider.tsx)

```tsx
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
```

**Usage** (already in [../app/layout.tsx](../app/layout.tsx)):
```tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

### Mode Toggle Component

**File**: [mode-toggle.tsx](mode-toggle.tsx)

```tsx
'use client'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

### Convex Client Provider

**File**: [ConvexClientProvider.tsx](ConvexClientProvider.tsx)

Integrates Clerk authentication with Convex:

```tsx
'use client'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { ConvexReactClient } from 'convex/react'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({ children }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
```

**Usage**: Wrap entire app in root layout (already done).

---

## Animation Components

### Using Motion Primitives

```tsx
import { FadeIn } from '@/components/motion-primitives/fade-in'

function AnimatedComponent() {
  return (
    <FadeIn>
      <div>This fades in on mount</div>
    </FadeIn>
  )
}
```

### Using Framer Motion (Direct)

```tsx
'use client'
import { motion } from 'framer-motion'

function AnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        {/* Card content */}
      </Card>
    </motion.div>
  )
}
```

**Best Practice**: Use motion primitives for common patterns, raw Framer Motion for custom animations.

---

## Chart Components

### Using Recharts with shadcn Chart

**File**: See [../app/dashboard/chart-area-interactive.tsx](../app/dashboard/chart-area-interactive.tsx) for complete example.

```tsx
'use client'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

const chartConfig = {
  views: {
    label: 'Views',
    color: 'hsl(var(--chart-1))',
  },
  clicks: {
    label: 'Clicks',
    color: 'hsl(var(--chart-2))',
  },
}

export function MyChart({ data }) {
  return (
    <ChartContainer config={chartConfig}>
      <AreaChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="views"
          type="natural"
          fill="var(--color-views)"
          stroke="var(--color-views)"
        />
      </AreaChart>
    </ChartContainer>
  )
}
```

**Key Points**:
- ✅ Use `ChartContainer` wrapper for consistent styling
- ✅ Define `chartConfig` with design tokens
- ✅ Use `var(--color-*)` for fill/stroke colors
- ❌ **DON'T** hardcode chart colors

---

## Common Component Gotchas

### 1. Forgetting 'use client' Directive

Many shadcn components use React hooks, requiring `'use client'`:

```tsx
// ❌ DON'T - Will error
import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'

function Component() {
  const [open, setOpen] = useState(false) // Error: hooks in Server Component
  return <Dialog open={open}>...</Dialog>
}

// ✅ DO - Add 'use client'
'use client'
import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'

function Component() {
  const [open, setOpen] = useState(false)
  return <Dialog open={open}>...</Dialog>
}
```

### 2. Not Using asChild for Composition

```tsx
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// ❌ DON'T - Creates nested elements
<Link href="/">
  <Button>Home</Button>
</Link>

// ✅ DO - Button becomes the Link
<Button asChild>
  <Link href="/">Home</Link>
</Button>
```

### 3. Hardcoding Colors

```tsx
// ❌ DON'T - Hardcoded colors
<div className="bg-blue-500 text-white">

// ✅ DO - Use design tokens
<div className="bg-primary text-primary-foreground">

// ❌ DON'T - Inline styles
<div style={{ backgroundColor: '#3b82f6' }}>

// ✅ DO - Tailwind with tokens
<div className="bg-primary">
```

### 4. Missing Accessibility Props

```tsx
import { Button } from '@/components/ui/button'

// ❌ DON'T - No accessible label for icon-only button
<Button size="icon">
  <TrashIcon />
</Button>

// ✅ DO - Add aria-label
<Button size="icon" aria-label="Delete item">
  <TrashIcon />
</Button>

// ✅ EVEN BETTER - Use Tooltip
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button size="icon" aria-label="Delete item">
        <TrashIcon />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Delete item</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### 5. Not Handling Loading States

```tsx
'use client'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function DataCard() {
  const data = useQuery(api.data.get)

  // ❌ DON'T - Forget loading state
  return <Card>{data.title}</Card> // Crashes when data is undefined

  // ✅ DO - Handle loading
  if (data === undefined) {
    return <Skeleton className="h-32 w-full" />
  }

  return <Card>{data.title}</Card>
}
```

---

## Creating Custom Components

### When to Create a Custom Component

Create a new component when:
- Pattern is used 3+ times
- Logic needs to be encapsulated
- Component is complex enough to test separately

**Don't over-abstract**: Keep components close to usage until pattern emerges.

### Custom Component Template

```tsx
// components/custom/my-component.tsx
'use client' // Only if uses hooks or browser APIs

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// 1. Define variants (optional)
const myComponentVariants = cva(
  'base-classes-here',
  {
    variants: {
      variant: {
        default: 'variant-classes',
        secondary: 'other-variant-classes',
      },
      size: {
        default: 'size-classes',
        sm: 'small-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// 2. Define props interface
export interface MyComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof myComponentVariants> {
  // Custom props here
  customProp?: string
}

// 3. Implement component
export const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, variant, size, customProp, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(myComponentVariants({ variant, size, className }))}
        {...props}
      >
        {/* Component implementation */}
      </div>
    )
  }
)
MyComponent.displayName = 'MyComponent'
```

---

## Quick Search Commands

### Find Components
```bash
# Find all shadcn components
ls components/ui/

# Find component definition
rg -n "^export (function|const) \w+Component" components/

# Find component usage
rg -n "<ComponentName" app/ components/
```

### Find Variants
```bash
# Find CVA variant definitions
rg -n "const \w+Variants = cva" components/

# Find variant usage
rg -n 'variant="' app/ components/
```

### Find Client Components
```bash
# Find all client components
rg -n "^'use client'" components/

# Find useState usage (requires 'use client')
rg -n "useState" components/
```

### Find Design Token Usage
```bash
# Find background colors
rg -n 'bg-(primary|secondary|accent|muted)' components/

# Find text colors
rg -n 'text-(primary|secondary|muted)' components/
```

---

## Testing Components (Future)

When ready to add testing:

```tsx
// components/ui/button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

test('button renders with correct text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
})

test('button calls onClick handler', async () => {
  const handleClick = vi.fn()
  render(<Button onClick={handleClick}>Click me</Button>)

  await userEvent.click(screen.getByRole('button'))

  expect(handleClick).toHaveBeenCalledTimes(1)
})

test('button applies variant classes', () => {
  render(<Button variant="destructive">Delete</Button>)
  const button = screen.getByRole('button')
  expect(button).toHaveClass('bg-destructive')
})
```

---

## Related Documentation

- **Root guidelines**: [../CLAUDE.md](../CLAUDE.md)
- **Dashboard usage**: [../app/dashboard/CLAUDE.md](../app/dashboard/CLAUDE.md)
- **shadcn/ui docs**: https://ui.shadcn.com
- **Radix UI docs**: https://www.radix-ui.com
- **Tailwind CSS docs**: https://tailwindcss.com

---

**Last Updated**: November 2024
**Status**: Core shadcn/ui components configured, animation libraries integrated
**Next Steps**: Add custom components for 360 viewer, splat viewer UI
