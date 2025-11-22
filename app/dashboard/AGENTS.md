# AGENTS.md - Dashboard

## Package Identity

**Purpose**: Protected dashboard area with sidebar navigation, charts, data tables, and payment-gated content  
**Tech**: Next.js 15 App Router, Clerk auth, Convex queries, Recharts, TanStack Table, Tabler Icons

---

## Setup & Run

```bash
# Development server (from root)
bun run dev

# Convex must be running
bunx convex dev

# Visit dashboard (requires authentication)
# http://localhost:3000/dashboard

# Build for production
bun run build
```

---

## Patterns & Conventions

### File Organization
- **Layout**: `layout.tsx` - Defines sidebar layout for all dashboard pages
- **Page components**: `page.tsx` files in each route folder
- **Shared components**: Colocated with dashboard (`app-sidebar.tsx`, `site-header.tsx`, etc.)
- **Protected routes**: Middleware automatically protects `/dashboard` and all sub-routes

### Authentication Pattern
```tsx
// ❌ DON'T: Manually check auth in dashboard pages
// The middleware already protects all /dashboard/* routes

// ✅ DO: Use Clerk hooks when you need user data
import { useUser } from '@clerk/nextjs'

function Component() {
  const { user } = useUser()
  return <div>Hello {user?.firstName}</div>
}

// ✅ DO: Use Convex queries to fetch user-specific data
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

function Component() {
  const userData = useQuery(api.users.getCurrentUser)
  // ...
}
```

### Dashboard Layout Structure
**Reference**: `layout.tsx`

```tsx
// Layout hierarchy:
<SidebarProvider>
  <AppSidebar />              // Left sidebar with navigation
  <SidebarInset>
    <LoadingBar />            // Top loading indicator
    <SiteHeader />            // Dashboard header
    <div>{children}</div>     // Page content
  </SidebarInset>
</SidebarProvider>
```

### Sidebar Navigation Pattern
**Reference**: `app-sidebar.tsx`

```tsx
// ✅ DO: Define navigation in data structure
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,  // Tabler Icons
    },
  ],
  navSecondary: [...],
  documents: [...],
}

// ✅ DO: Use NavMain, NavSecondary, NavDocuments components
<Sidebar>
  <SidebarHeader>...</SidebarHeader>
  <SidebarContent>
    <NavMain items={data.navMain} />
    <NavDocuments documents={data.documents} />
    <NavSecondary items={data.navSecondary} />
  </SidebarContent>
  <SidebarFooter>
    <NavUser />
  </SidebarFooter>
</Sidebar>
```

### Page Composition Pattern
**Reference**: `page.tsx`

```tsx
// ✅ DO: Import and compose section components
import { ChartAreaInteractive } from "@/app/dashboard/chart-area-interactive"
import { DataTable } from "@/app/dashboard/data-table"
import { SectionCards } from "@/app/dashboard/section-cards"

export default function Page() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  )
}
```

### Data Visualization Patterns
**Reference**: `chart-area-interactive.tsx`

```tsx
// ✅ DO: Use Recharts for charts
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"

// ✅ DO: Define chart config
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig
```

### Data Table Pattern
**Reference**: `data-table.tsx`

```tsx
// ✅ DO: Use TanStack Table with shadcn/ui
import { useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// ✅ DO: Define columns with type safety
const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
]
```

### Payment Gating Pattern
**Reference**: `payment-gated/page.tsx`

```tsx
// ✅ DO: Query payment status from Convex
const paymentAttempts = useQuery(api.paymentAttempts.getUserPaymentAttempts)

// ✅ DO: Show pricing table if no active subscription
if (!hasActiveSubscription) {
  return <CustomClerkPricing />
}

// ✅ DO: Show protected content if subscribed
return <div>Premium content here</div>
```

---

## Touch Points / Key Files

### Core Layout
- **Layout**: `layout.tsx` - Sidebar layout wrapper
- **Sidebar**: `app-sidebar.tsx` - Main navigation sidebar
- **Header**: `site-header.tsx` - Dashboard header with breadcrumbs/actions
- **Loading**: `loading-bar.tsx` - Top loading indicator

### Navigation Components
- **Main nav**: `nav-main.tsx` - Primary navigation items
- **Documents nav**: `nav-documents.tsx` - Document/file navigation
- **Secondary nav**: `nav-secondary.tsx` - Settings/help links
- **User nav**: `nav-user.tsx` - User profile dropdown

### Dashboard Sections
- **Cards**: `section-cards.tsx` - Stat cards with metrics
- **Charts**: `chart-area-interactive.tsx` - Interactive area chart
- **Data table**: `data-table.tsx` - Sortable, filterable table with TanStack Table
- **Payment gated**: `payment-gated/page.tsx` - Subscription-protected content

### Data
- **Mock data**: `data.json` - Sample data for tables/charts (replace with Convex queries)

---

## JIT Index Hints

```bash
# Find all dashboard pages
find app/dashboard -name "page.tsx"

# Find navigation usage
rg -n "NavMain|NavSecondary|NavDocuments" app/dashboard/

# Find Convex query usage
rg -n "useQuery.*api\." app/dashboard/ --type tsx

# Find Clerk auth usage
rg -n "useUser|useAuth" app/dashboard/ --type tsx

# Find chart components
rg -n "AreaChart|BarChart|LineChart" app/dashboard/

# Find table usage
rg -n "useReactTable|ColumnDef" app/dashboard/

# Find icon imports
rg -n "@tabler/icons-react" app/dashboard/
```

---

## Common Gotchas

- **Protected routes**: All `/dashboard/*` routes are automatically protected by middleware - don't add redundant auth checks
- **Convex queries**: Must wrap components using `useQuery` with `"use client"` directive
- **Sidebar state**: Sidebar state is managed by `SidebarProvider` context - don't manage it manually
- **Data loading**: Use Convex `useQuery` for real-time data, not `data.json` (that's just example data)
- **Icons**: Dashboard uses Tabler Icons (`@tabler/icons-react`), not Lucide (landing pages use Lucide)
- **Responsive layout**: Sidebar collapses on mobile, ensure content works with and without sidebar

---

## Examples to Follow

### Creating a New Dashboard Page
1. Create `app/dashboard/new-feature/page.tsx`
2. Add navigation item to `app-sidebar.tsx` data object
3. Compose page with section components
4. Use Convex queries for data fetching

### Adding a Chart Section
**Copy from**: `chart-area-interactive.tsx`
- Use `Card` wrapper for consistent styling
- Define `chartConfig` with chart theme colors
- Use `ChartContainer` with responsive config
- Add interactivity with state hooks

### Adding a Data Table
**Copy from**: `data-table.tsx`
- Define column definitions with `ColumnDef<T>[]`
- Use `useReactTable` hook with plugins
- Wrap with `Card` for consistent styling
- Add sorting, filtering, pagination as needed

### Payment-Gated Content
**Copy from**: `payment-gated/page.tsx`
- Query payment attempts from Convex
- Check subscription status
- Show `CustomClerkPricing` if not subscribed
- Render protected content if subscribed

---

## Pre-PR Checks

```bash
# Lint
bun run lint

# Build
bun run build

# Type check
bunx tsc --noEmit

# Visual checks:
# 1. Sign in/out works correctly
# 2. All navigation links work
# 3. Sidebar expands/collapses on mobile
# 4. Charts render without errors
# 5. Data tables are sortable/filterable
# 6. Payment gating works (test with/without subscription)
# 7. Dark/light theme works in all components
```

---

## Data Integration

### Replace Mock Data with Convex
```tsx
// ❌ DON'T: Use static data.json
import data from "./data.json"

// ✅ DO: Use Convex queries
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

function Component() {
  const data = useQuery(api.myModule.myQuery)
  if (!data) return <div>Loading...</div>
  // Use data
}
```

### User-Specific Data
```tsx
// ✅ DO: Filter by current user in Convex functions
// Convex automatically provides auth context

// In convex/myData.ts:
export const getUserData = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")
    
    return await ctx.db
      .query("myTable")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .collect()
  },
})
```
