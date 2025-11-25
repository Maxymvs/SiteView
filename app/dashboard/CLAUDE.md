# Dashboard - Protected Application Area

**Technology**: Next.js 15 App Router with React 19
**Entry Point**: [app/dashboard/page.tsx](page.tsx)
**Parent Context**: This extends [../../CLAUDE.md](../../CLAUDE.md)

---

## Overview

The dashboard is the main protected area of SiteView where authenticated users:
- View and manage their 360° visualizations
- Access analytics and metrics (charts, data tables)
- Manage their account and subscription
- Access premium features (payment-gated content)

**Authentication**: All routes under `/dashboard` require Clerk authentication (enforced by [middleware.ts](../../middleware.ts))

---

## Development Commands

### This Directory (from root)
```bash
# Start development server (entire app)
bun dev

# Type check dashboard files
bunx tsc --noEmit app/dashboard/**/*.tsx

# Lint dashboard files
bunx eslint app/dashboard/
```

### Testing Changes
1. Run `bun dev`
2. Navigate to `http://localhost:3000/dashboard`
3. Must be signed in (redirects to Clerk sign-in if not)

---

## Architecture

### Directory Structure
```
app/dashboard/
├── layout.tsx              # Dashboard layout with sidebar
├── page.tsx                # Main dashboard view
├── app-sidebar.tsx         # Left sidebar navigation
├── site-header.tsx         # Top header with breadcrumbs
├── nav-main.tsx            # Main navigation items
├── nav-documents.tsx       # Documents navigation section
├── nav-secondary.tsx       # Secondary navigation (support, feedback)
├── nav-user.tsx            # User menu (profile, settings, sign out)
├── data-table.tsx          # Large interactive data table (~500 lines)
├── chart-area-interactive.tsx # Interactive area chart
├── section-cards.tsx       # Dashboard metric cards
├── loading-bar.tsx         # Loading indicator component
├── data.json               # Mock data for charts/tables
├── payment-gated/          # Premium content directory
│   └── page.tsx            # Subscription-gated feature page
├── AGENTS.md               # Legacy agent guidance (consider merging with this)
└── CLAUDE.md               # This file
```

### Layout Hierarchy
```
app/layout.tsx (root)
  └── ThemeProvider + ClerkProvider + ConvexProvider
      └── app/dashboard/layout.tsx
          ├── <AppSidebar />
          └── <main>
              ├── <SiteHeader />
              └── {children} (page.tsx)
```

---

## Code Organization Patterns

### 1. Layout Component Pattern

**File**: [layout.tsx](layout.tsx)

The dashboard layout uses the shadcn `SidebarProvider` component:

```tsx
'use client'

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

**Key Points**:
- ✅ Marked `'use client'` because `SidebarProvider` uses context
- ✅ Wraps entire dashboard section
- ✅ Provides sidebar state to all child components

### 2. Navigation Component Pattern

**Navigation structure**:
- **Main Nav** ([nav-main.tsx](nav-main.tsx)): Primary features (Dashboard, Videos, Splats)
- **Documents Nav** ([nav-documents.tsx](nav-documents.tsx)): Document/project management
- **Secondary Nav** ([nav-secondary.tsx](nav-secondary.tsx)): Support, feedback links
- **User Nav** ([nav-user.tsx](nav-user.tsx)): Profile, billing, sign out

**Pattern to follow**:
```tsx
'use client'

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import Link from 'next/link'

export function NavExample() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href="/dashboard/feature">
            <Icon />
            <span>Feature Name</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
```

**Common Gotchas**:
- ❌ **DON'T** use `<a>` tags directly (breaks Next.js routing)
- ✅ **DO** use `<Link>` from `next/link`
- ❌ **DON'T** forget `asChild` prop on `SidebarMenuButton` when wrapping a `Link`

### 3. Data Table Pattern

**File**: [data-table.tsx](data-table.tsx) (~500 lines)

This is a complex, feature-rich table with:
- Pagination
- Sorting (multi-column)
- Filtering (text search, faceted filters)
- Column visibility toggle
- Row selection
- Responsive design

**Key Implementation Details**:
- Uses `@tanstack/react-table` library
- State managed locally with `useState`
- Column definitions via `createColumnHelper`
- Data sourced from [data.json](data.json)

**When to modify**:
- Adding new columns: Update column definitions in `columns` array
- Adding filters: Add to `columnFilters` state and filter UI
- Changing data source: Replace mock data import with Convex query

**Example: Adding a Convex data source**:
```tsx
'use client'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

function DataTable() {
  // Replace mock data with real data
  const data = useQuery(api.yourTable.list) ?? []

  if (data === undefined) return <div>Loading...</div>

  // Rest of table logic...
}
```

### 4. Chart Pattern

**File**: [chart-area-interactive.tsx](chart-area-interactive.tsx)

Charts use Recharts library wrapped in shadcn's `Chart` component:

```tsx
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

<ChartContainer config={chartConfig}>
  <AreaChart data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="date" />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Area dataKey="value" stroke="var(--color-primary)" />
  </AreaChart>
</ChartContainer>
```

**Key Points**:
- ✅ Use design tokens for colors: `var(--color-primary)`
- ✅ Configure chart colors in `chartConfig` object
- ✅ Use `ChartTooltip` and `ChartTooltipContent` for consistent tooltips
- ❌ **DON'T** hardcode colors like `#3b82f6`

### 5. Card Pattern

**File**: [section-cards.tsx](section-cards.tsx)

Dashboard metrics displayed as cards:

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Metric Name</CardTitle>
    <CardDescription>Metric description</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">1,234</div>
    <p className="text-xs text-muted-foreground">+20% from last month</p>
  </CardContent>
</Card>
```

**Metric Card Best Practices**:
- ✅ Use semantic typography sizes: `text-2xl`, `text-xs`
- ✅ Use muted colors for secondary text: `text-muted-foreground`
- ✅ Include comparison context (% change, trend indicator)
- ✅ Keep cards consistent in size (use grid layout)

---

## Key Files & Touch Points

### Core Files (understand these first)

1. **[layout.tsx](layout.tsx)** - Dashboard layout wrapper
   - Sets up sidebar provider
   - Includes header and navigation
   - Wraps all dashboard pages

2. **[page.tsx](page.tsx)** - Main dashboard view
   - Composes cards, charts, and table
   - Entry point when user navigates to `/dashboard`

3. **[app-sidebar.tsx](app-sidebar.tsx)** - Complete sidebar component
   - Renders all navigation sections
   - Includes user menu
   - Collapsible on mobile

4. **[data-table.tsx](data-table.tsx)** - Complex table implementation
   - Reference for building tables
   - Shows pagination, sorting, filtering patterns
   - Currently uses mock data from [data.json](data.json)

### Navigation Files

- **[nav-main.tsx](nav-main.tsx)** - Primary feature navigation
  - Links to main app features
  - Icons + labels
  - Collapsible groups

- **[nav-documents.tsx](nav-documents.tsx)** - Document navigation
  - File/folder structure navigation
  - Project management

- **[nav-secondary.tsx](nav-secondary.tsx)** - Secondary links
  - Support, feedback, settings

- **[nav-user.tsx](nav-user.tsx)** - User menu
  - Profile link
  - Account settings
  - Billing (Clerk integration)
  - Sign out

### Data Visualization Files

- **[chart-area-interactive.tsx](chart-area-interactive.tsx)** - Chart example
  - Area chart with Recharts
  - Interactive tooltips
  - Time-series data visualization

- **[section-cards.tsx](section-cards.tsx)** - Metric cards
  - KPI display pattern
  - Card layout composition

### Premium Features

- **[payment-gated/page.tsx](payment-gated/page.tsx)** - Subscription gate
  - Shows paywall for non-subscribers
  - Integrates with Clerk Billing
  - Example of premium content protection

---

## Common Patterns & Examples

### Pattern 1: Adding a New Dashboard Page

**Steps**:
1. Create new file: `app/dashboard/my-feature/page.tsx`
2. Add navigation link in [nav-main.tsx](nav-main.tsx)
3. Implement page component (can be Server Component if no interactivity needed)

**Example**:
```tsx
// app/dashboard/my-feature/page.tsx
export default function MyFeaturePage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-3xl font-bold">My Feature</h1>
      <p className="text-muted-foreground">Feature description</p>
      {/* Feature content */}
    </div>
  )
}
```

```tsx
// Update nav-main.tsx
import { MyIcon } from 'lucide-react'

const navItems = [
  // ... existing items
  {
    title: 'My Feature',
    url: '/dashboard/my-feature',
    icon: MyIcon,
  },
]
```

### Pattern 2: Fetching Data from Convex

**Replace mock data with real queries**:

```tsx
'use client'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function DashboardMetrics() {
  // Fetch real data
  const metrics = useQuery(api.metrics.getDashboardMetrics)

  // Handle loading state
  if (metrics === undefined) {
    return <div>Loading metrics...</div>
  }

  // Handle unauthenticated (should not happen due to middleware)
  if (metrics === null) {
    return <div>Authentication required</div>
  }

  // Render metrics
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.id}>
          <CardHeader>
            <CardTitle>{metric.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### Pattern 3: Adding Interactive Elements

**Use shadcn/ui components for consistency**:

```tsx
'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'

export function InteractiveFeature() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Feature</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feature Title</DialogTitle>
          <DialogDescription>Feature description</DialogDescription>
        </DialogHeader>
        {/* Dialog content */}
      </DialogContent>
    </Dialog>
  )
}
```

### Pattern 4: Protected Premium Content

**Follow the payment-gated pattern**:

```tsx
'use client'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PremiumFeature() {
  const { user } = useUser()

  // Check if user has active subscription
  // (Clerk Billing integration - exact implementation depends on your setup)
  const hasSubscription = user?.publicMetadata?.subscription === 'active'

  if (!hasSubscription) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-2xl font-bold">Premium Feature</h2>
        <p className="text-muted-foreground">
          This feature requires an active subscription.
        </p>
        <Button asChild>
          <Link href="/dashboard/billing">Upgrade Now</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Premium content here */}
    </div>
  )
}
```

---

## Quick Search Commands

### Find Components
```bash
# Find dashboard component definitions
rg -n "^export (function|const|default)" app/dashboard/

# Find component usage
rg -n "<ComponentName" app/dashboard/

# Find all client components
rg -n "^'use client'" app/dashboard/
```

### Find Navigation Items
```bash
# Find all navigation links
rg -n "href=" app/dashboard/ | grep -E "(nav-|sidebar)"

# Find icon usage
rg -n "from 'lucide-react'" app/dashboard/
```

### Find Data Sources
```bash
# Find Convex queries
rg -n "useQuery\(api\." app/dashboard/

# Find Convex mutations
rg -n "useMutation\(api\." app/dashboard/

# Find mock data usage
rg -n "data\.json" app/dashboard/
```

### Find Styling
```bash
# Find Tailwind classes
rg -n 'className="[^"]*"' app/dashboard/page.tsx

# Find components from shadcn/ui
rg -n "from '@/components/ui/" app/dashboard/
```

---

## Common Gotchas

### 1. Client vs Server Components
- **Sidebar components require `'use client'`** (they use React context)
- **Page components can be Server Components** unless they use hooks/interactivity
- **Data fetching**: Convex `useQuery` requires `'use client'`

```tsx
// ❌ DON'T - Trying to use useQuery in Server Component
export default function Page() {
  const data = useQuery(api.data.list) // Error!
}

// ✅ DO - Mark as client component
'use client'
export default function Page() {
  const data = useQuery(api.data.list) // Works!
}
```

### 2. Navigation Links
- **Always use `next/link`** for internal navigation
- **Use `asChild` prop** when wrapping custom components

```tsx
// ❌ DON'T
<SidebarMenuButton>
  <a href="/dashboard/page">Link</a>
</SidebarMenuButton>

// ✅ DO
<SidebarMenuButton asChild>
  <Link href="/dashboard/page">Link</Link>
</SidebarMenuButton>
```

### 3. Authentication Checks
- **Middleware handles auth** - No need to check in components
- **If you need user data**, use Clerk hooks:

```tsx
'use client'
import { useUser } from '@clerk/nextjs'

function Component() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div> // Should not happen due to middleware

  return <div>Hello {user.firstName}</div>
}
```

### 4. Data Table Performance
- **Mock data is fine for development** ([data.json](data.json))
- **For production**, replace with Convex query and add pagination
- **Large datasets**: Use Convex pagination (`.paginate()` method)

### 5. Responsive Design
- **Sidebar is collapsible** on mobile (automatic via `SidebarProvider`)
- **Tables scroll horizontally** on mobile (`overflow-x-auto`)
- **Use responsive grid classes**: `md:grid-cols-2 lg:grid-cols-4`

```tsx
// ✅ Good responsive pattern
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Cards */}
</div>
```

---

## Integration with Other Areas

### With Convex Backend
- Import API from `@/convex/_generated/api`
- Use `useQuery` for reads, `useMutation` for writes
- See [../../convex/CLAUDE.md](../../convex/CLAUDE.md) for backend patterns

### With Clerk Authentication
- User automatically authenticated by middleware
- Access user data via `useUser()` hook
- Check subscription status via `user.publicMetadata`

### With Components Library
- Import shadcn components from `@/components/ui/`
- See [../../components/CLAUDE.md](../../components/CLAUDE.md) for component usage

---

## Future Enhancements

### Planned Features (from PRD)
- [ ] 360 video viewer page (`/dashboard/videos/[id]`)
- [ ] Gaussian splat viewer page (`/dashboard/splats/[id]`)
- [ ] Upload/management interface for user content
- [ ] Analytics dashboard with real metrics
- [ ] Collaboration features (sharing, commenting)

### Technical Improvements
- [ ] Replace mock data with Convex queries
- [ ] Add real-time updates for collaborative features
- [ ] Implement proper error boundaries
- [ ] Add skeleton loading states
- [ ] Optimize data table for large datasets (virtualization)
- [ ] Add keyboard shortcuts for navigation

---

## Testing Dashboard Features

### Manual Testing Checklist
When modifying dashboard:
- [ ] Test while signed in (main use case)
- [ ] Test sidebar collapse/expand on mobile
- [ ] Test all navigation links work
- [ ] Test dark/light theme toggle
- [ ] Test data table sorting, filtering, pagination
- [ ] Test responsive behavior (mobile, tablet, desktop)
- [ ] Test browser back/forward navigation

### Common Test Scenarios
```bash
# 1. Start dev server
bun dev

# 2. Navigate to dashboard
open http://localhost:3000/dashboard

# 3. Sign in via Clerk (if not already)
# 4. Test feature
# 5. Check console for errors (Cmd+Option+I in Chrome)
```

---

## Related Documentation

- **Root guidelines**: [../../CLAUDE.md](../../CLAUDE.md)
- **Convex backend**: [../../convex/CLAUDE.md](../../convex/CLAUDE.md)
- **Component library**: [../../components/CLAUDE.md](../../components/CLAUDE.md)
- **Product requirements**: [../../docs/planning/siteview_360_prd.md](../../docs/planning/siteview_360_prd.md)

---

**Last Updated**: November 2024
**Status**: MVP development - mock data, basic layout complete
**Next Steps**: Replace mock data with Convex, add 360 viewer page
