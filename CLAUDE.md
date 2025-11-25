# SiteView - 360° Visualization SaaS Platform

## Overview

- **Type**: Next.js 15 SaaS Application (App Router)
- **Stack**: React 19, TypeScript, Tailwind v4, Convex, Clerk
- **Architecture**: Full-stack monolithic application with serverless backend
- **Stage**: Early development (MVP phase)
- **Developer**: Solo developer (non-professional background)

This CLAUDE.md is the authoritative source for development guidelines. Subdirectories contain specialized CLAUDE.md files that extend these rules.

---

## Universal Development Rules

### Code Quality (MUST)

- **MUST** write TypeScript in strict mode (already configured in tsconfig.json)
- **MUST** use the `@/` import alias for all internal imports (configured for root-level imports)
- **MUST** add `"use client"` directive to components using hooks, browser APIs, or interactivity
- **MUST NOT** commit secrets, API keys, or tokens (use .env.local)
- **MUST NOT** use `v.any()` in Convex schemas - define explicit types instead
- **MUST NOT** silence TypeScript errors with `@ts-ignore` - fix types or use `@ts-expect-error` with explanation
- **MUST NOT** hardcode colors - use design tokens from globals.css or theme variables
- **MUST NOT** create React class components - use functional components with hooks
- **MUST NOT** manipulate DOM directly - use React state, props, and refs

### Best Practices (SHOULD)

- **SHOULD** prefer Server Components by default (Next.js 15 App Router default behavior)
- **SHOULD** use descriptive variable names (avoid single letters except loop counters)
- **SHOULD** keep functions focused and under 50 lines
- **SHOULD** extract complex logic into separate utility functions
- **SHOULD** co-locate related files (component + styles + tests in same directory when tests exist)
- **SHOULD** use Convex queries for data fetching and mutations for updates
- **SHOULD** follow existing patterns from similar files before creating new approaches

### Anti-Patterns (MUST NOT)

**1. Type Safety Violations**
```typescript
// ❌ DON'T - Using any in Convex schema
export default defineTable({
  data: v.any() // Too permissive
})

// ✅ DO - Define explicit schema
export default defineTable({
  data: v.object({
    title: v.string(),
    count: v.number()
  })
})
```

**2. Styling Violations**
```tsx
// ❌ DON'T - Hardcoded colors
<div className="bg-blue-500 text-gray-900">

// ✅ DO - Use design tokens
<div className="bg-primary text-foreground">
```

**3. Component Pattern Violations**
```tsx
// ❌ DON'T - Class components
class MyComponent extends React.Component { }

// ✅ DO - Functional components
function MyComponent() { }

// ❌ DON'T - Direct DOM manipulation
function Bad() {
  useEffect(() => {
    document.getElementById('my-div').innerHTML = 'text'
  }, [])
}

// ✅ DO - Use React state
function Good() {
  const [text, setText] = useState('text')
  return <div>{text}</div>
}
```

**4. Client/Server Component Confusion**
```tsx
// ❌ DON'T - Forgetting 'use client' with hooks
import { useState } from 'react'
function Interactive() { // Will error
  const [count, setCount] = useState(0)
}

// ✅ DO - Add 'use client' directive
'use client'
import { useState } from 'react'
function Interactive() {
  const [count, setCount] = useState(0)
}
```

---

## Core Commands

### Development
```bash
bun dev              # Start development server with Turbopack
bun build            # Build for production
bun start            # Start production server
bun lint             # Run ESLint
```

### Convex Backend
```bash
bunx convex dev      # Start Convex development (run in separate terminal)
bunx convex deploy   # Deploy Convex functions to production
```

### Quality Gates (run before committing)
```bash
bun run typecheck && bun lint && bun build
```

**Note**: Testing framework not yet set up. See [Testing Strategy](#testing-strategy-future) below.

---

## Project Structure

### Applications
- **`app/(landing)/`** → Public landing page (grouped route)
  - `page.tsx` - Landing page composition
  - `hero-section.tsx`, `features-one.tsx`, `testimonials.tsx`, `faqs.tsx`
  - `call-to-action.tsx`, `footer.tsx`, `table.tsx`
  - No authentication required

- **`app/dashboard/`** → Protected dashboard ([see app/dashboard/CLAUDE.md](app/dashboard/CLAUDE.md))
  - `page.tsx` - Main dashboard view
  - `layout.tsx` - Dashboard layout with sidebar
  - `app-sidebar.tsx`, `site-header.tsx` - Navigation components
  - `data-table.tsx` - Large interactive data table
  - `chart-area-interactive.tsx` - Dashboard charts
  - `payment-gated/` - Premium content (requires active subscription)
  - Requires Clerk authentication (protected by middleware.ts)

### Components
- **`components/ui/`** → shadcn/ui components (25+ components)
  - Base components: `button.tsx`, `card.tsx`, `input.tsx`, `select.tsx`
  - Layout: `sidebar.tsx`, `table.tsx`, `tabs.tsx`, `sheet.tsx`
  - Feedback: `dialog.tsx`, `tooltip.tsx`, `sonner.tsx` (toasts)
  - Data viz: `chart.tsx` (Recharts wrapper)

- **`components/magicui/`** → MagicUI animation components
- **`components/react-bits/`** → React Bits animation library
- **`components/kokonutui/`** → Kokonut UI components
- **`components/motion-primitives/`** → Motion Primitives animations

- **See [components/CLAUDE.md](components/CLAUDE.md) for component development patterns**

### Backend (Convex)
- **`convex/`** → Backend logic and database ([see convex/CLAUDE.md](convex/CLAUDE.md))
  - `schema.ts` - Database schema (users, paymentAttempts tables)
  - `auth.config.ts` - Clerk JWT authentication configuration
  - `http.ts` - Webhook endpoints (Clerk user sync, payment events)
  - `users.ts` - User queries and mutations
  - `paymentAttempts.ts` - Payment tracking
  - `_generated/` - Auto-generated API types (DO NOT edit manually)

### Infrastructure
- **`middleware.ts`** → Route protection via Clerk
  - Protects `/dashboard/*` routes (requires authentication)
  - Configures public routes (landing page, sign-in, sign-up)

- **`app/layout.tsx`** → Root layout
  - Providers: ThemeProvider, ClerkProvider, ConvexClientProvider
  - Global fonts (Geist Sans/Mono)
  - Base metadata

### Utilities & Hooks
- **`lib/utils.ts`** → Utility functions
  - `cn()` - Tailwind class merging helper

- **`hooks/use-mobile.ts`** → Mobile breakpoint detection (768px)

### Static Assets
- **`public/`** → Images, icons, fonts
  - `hero-section-main-app-dark.png` - Hero image
  - SVG icons: `file.svg`, `globe.svg`, `window.svg`

### Configuration Files
- **`tsconfig.json`** → TypeScript configuration (strict mode, `@/` alias)
- **`next.config.ts`** → Next.js configuration (minimal)
- **`postcss.config.mjs`** → Tailwind v4 PostCSS plugin
- **`components.json`** → shadcn/ui configuration (New York style)
- **`package.json`** → Dependencies and scripts

### Documentation
- **`docs/planning/`** → Product planning documents
  - `siteview_360_prd.md` - Product Requirements Document
  - `siteview_360_dev_plan.md` - Development roadmap
  - `billing-future-plans.md` - Billing feature planning
  - `linear-planning-summary.md`, `linear-timeline.md` - Linear integration plans

- **`docs/checkpoints/`** → Progress checkpoints
  - `2025-11-22-initial-setup.md` - Initial setup checkpoint

- **`docs/agent-rules/`** → Framework-specific rules
  - `nextjs15-typescript-tailwind-rules.md` - Next.js 15 best practices
  - `bun-rules.md` - Bun package manager usage
  - `convex-rules.md` - Convex backend patterns
  - `Tailwind-v4-rules.md` - Tailwind v4 specifics

---

## Quick Find Commands

### Code Navigation
```bash
# Find a component definition
rg -n "^export (function|const|default)" components/

# Find component usage
rg -n "<ComponentName" app/

# Find hooks
rg -n "export const use[A-Z]" hooks/

# Find API routes (Next.js App Router)
rg -n "export async function (GET|POST|PUT|DELETE)" app/

# Find Convex queries/mutations
rg -n "export const \w+ = (query|mutation|action)" convex/

# Find type definitions
rg -n "^export (type|interface)" --type ts
```

### Dependency Analysis
```bash
# Check why a package is installed
bun pm ls <package-name>

# List all dependencies
bun pm ls

# Check for outdated packages
bun outdated
```

### Git & Project Status
```bash
# Current status
git status

# Recent commits
git log --oneline -10

# See what changed in a file
git diff <file-path>
```

---

## Environment Variables

### Required Variables (in .env.local)

**Convex Backend:**
```bash
CONVEX_DEPLOYMENT=<your-deployment-id>
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
```

**Clerk Authentication (Frontend):**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

**Clerk Authentication (Backend):**
```bash
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=<your-clerk-frontend-api>
```

**Convex Webhooks (for Convex Dashboard only):**
```bash
CLERK_WEBHOOK_SECRET=whsec_...
```

### Security Rules
- **NEVER** commit `.env.local` to git (already in .gitignore)
- Use `.env.example` as a template for required variables
- PII (Personally Identifiable Information) must be redacted in logs
- API keys must never be logged or exposed in client-side code

---

## Authentication & Authorization

### Flow Overview
1. User signs in via Clerk (hosted UI or custom components)
2. Clerk issues JWT token stored in browser
3. Middleware (`middleware.ts`) checks token for protected routes
4. Convex receives JWT via `ctx.auth.getUserIdentity()`
5. Convex validates JWT issuer via `auth.config.ts`
6. Queries/mutations filtered by authenticated user

### Protected Routes
- `/dashboard` and all sub-routes (requires authentication)
- Landing page `/` and auth routes are public

### Key Files
- [middleware.ts](middleware.ts) - Route protection
- [components/ConvexClientProvider.tsx](components/ConvexClientProvider.tsx) - Clerk + Convex integration
- [convex/auth.config.ts](convex/auth.config.ts) - JWT configuration
- [convex/http.ts](convex/http.ts) - Webhook handlers for user sync

---

## Styling & Design System

### Approach
- **Tailwind CSS v4** with OKLch color space
- Design tokens defined in [app/globals.css](app/globals.css)
- Dark/light theme via `next-themes`
- No CSS modules or styled-components

### Design Tokens
```css
/* Primary colors (in app/globals.css) */
--primary: oklch(0.205 0 0)
--background: oklch(1 0 0)
--foreground: oklch(0.139 0 0)

/* Chart colors */
--chart-1 through --chart-5

/* Sidebar colors */
--sidebar-background, --sidebar-foreground, etc.
```

### Usage Pattern
```tsx
// ✅ DO - Use semantic tokens
<div className="bg-primary text-primary-foreground">

// ✅ DO - Use Tailwind utilities
<div className="flex items-center gap-4 p-6 rounded-lg">

// ❌ DON'T - Hardcode colors
<div className="bg-[#3b82f6] text-[#1e293b]">
```

### Component Variants
- Use `class-variance-authority` (CVA) for component variants
- See shadcn/ui components for reference patterns
- Example: [components/ui/button.tsx](components/ui/button.tsx)

---

## Data Fetching & State Management

### Convex Queries (Read Data)
```tsx
'use client'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

function MyComponent() {
  const user = useQuery(api.users.current)

  if (user === undefined) return <div>Loading...</div>
  if (user === null) return <div>Not authenticated</div>

  return <div>Hello {user.name}</div>
}
```

### Convex Mutations (Write Data)
```tsx
'use client'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'

function MyComponent() {
  const updateUser = useMutation(api.users.update)

  const handleSave = async () => {
    await updateUser({ name: 'New Name' })
  }

  return <button onClick={handleSave}>Save</button>
}
```

### State Management
- **Local state**: `useState` for component-specific state
- **Global auth state**: Managed by Clerk via `useAuth()` hook
- **Database state**: Managed by Convex (real-time sync)
- **No Redux/Zustand**: Not needed with Convex real-time database

---

## Git Workflow

### Branch Strategy
- **Main branch**: `main` (protected, always deployable)
- **Feature branches**: `feature/description` or `feat/description`
- **Bug fixes**: `fix/description`

### Commit Message Format
Use Conventional Commits:
```bash
feat: add 360 video player component
fix: resolve authentication redirect loop
docs: update PRD with viewer requirements
refactor: extract dashboard cards into separate components
chore: update dependencies
```

### Pre-Commit Checklist
Before committing, run:
```bash
bun run typecheck && bun lint && bun build
```

### Deployment
- Automatic deployment to Vercel on push to `main`
- Preview deployments for all branches
- Convex functions deployed separately with `bunx convex deploy`

---

## Testing Strategy (Future)

### Current Status
- **No testing framework configured yet**
- Manual testing via browser for now
- Plan to add Vitest + Testing Library in future

### When to Add Testing
- After core features are working (dashboard, 360 viewer, auth)
- When manual testing becomes time-consuming (>30 minutes per feature)
- Before adding complex features (YouTube integration, SuperSplat viewer)

### Recommended Setup (for future)
```bash
# When ready, install testing dependencies
bun add -d vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Testing Priorities (when implemented)
1. **Unit tests**: Utility functions in `lib/utils.ts`
2. **Component tests**: Key components like data table, charts
3. **Integration tests**: Convex queries/mutations
4. **E2E tests**: Critical user flows (sign in → dashboard → view 360 video)

### Test Location Strategy
- Co-locate with source: `Component.test.tsx` next to `Component.tsx`
- Integration tests: `tests/integration/`
- E2E tests: `tests/e2e/` (Playwright recommended for Next.js)

---

## Available Tools & Permissions

### Tools You Have Access To
- **Standard bash tools**: `rg` (ripgrep), `git`, `bun`, `node`
- **Convex CLI**: `bunx convex` for backend operations
- **MCP Servers** (configured):
  - Exa: Web search and documentation lookup
  - Linear: Project management integration (issues, projects, tasks)
  - (Future: Figma for design tokens, Convex MCP for enhanced backend ops)

### Tool Permissions
- ✅ Read any file in the project
- ✅ Write code files (TypeScript, TSX, CSS, etc.)
- ✅ Run development commands (`bun dev`, `bun lint`, etc.)
- ✅ Create and modify components, utilities, hooks
- ✅ Update documentation files
- ✅ Modify Convex schema and functions
- ⚠️ **Ask first** before editing `.env.local` (contains secrets)
- ⚠️ **Ask first** before modifying authentication code (security sensitive)
- ⚠️ **Ask first** before deleting Convex schema fields (data loss risk)

---

## Automation & Hooks (Future Configuration)

### Current Status
- **No hooks configured yet** (keeping it simple during MVP phase)
- Can be added later via `.claude/settings.json`

### Recommended Hooks (when ready to add)

**Auto-formatting** (after file writes):
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$CLAUDE_FILE_PATHS\" =~ \\.(ts|tsx)$ ]]; then bunx prettier --write \"$CLAUDE_FILE_PATHS\" 2>/dev/null || true; fi"
          }
        ]
      }
    ]
  }
}
```

**Block dangerous operations**:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$CLAUDE_TOOL_INPUT\" == *\"rm -rf\"* ]]; then echo 'BLOCKED: Dangerous command' && exit 2; fi"
          }
        ]
      }
    ]
  }
}
```

**When to add hooks:**
- When you're editing many files per session (formatting helps)
- When you want safety nets (block dangerous commands)
- When you have established patterns to enforce

---

## MCP Server Configuration

### Currently Configured
1. **Exa** - Web search and documentation
2. **Linear** - Project management (issues, projects)

### Future MCP Servers
- **Figma** - Design token extraction and sync
- **Convex** - Enhanced Convex operations

### Adding New MCP Servers
```bash
# Example: Add GitHub integration (if needed later)
claude mcp add --scope user github -- npx -y @modelcontextprotocol/server-github
```

---

## Specialized Context

When working in specific directories, refer to their CLAUDE.md for detailed guidance:

- **Dashboard development**: [app/dashboard/CLAUDE.md](app/dashboard/CLAUDE.md)
- **Backend & database**: [convex/CLAUDE.md](convex/CLAUDE.md)
- **Component development**: [components/CLAUDE.md](components/CLAUDE.md)

These files provide context-specific patterns, examples, and gotchas.

---

## Common Gotchas

### Next.js 15 App Router
- **Server Components by default**: Add `'use client'` only when using hooks/browser APIs
- **Dynamic routes**: Route parameters are now async (use `const params = await props.params`)
- **Environment variables**: Client-side vars need `NEXT_PUBLIC_` prefix

### Convex
- **Schema changes**: Run `bunx convex dev` to sync schema changes
- **Authentication**: Use `ctx.auth` not `ctx.identity` (Clerk integration)
- **Indexes**: Add indexes for fields you query frequently (see [convex/CLAUDE.md](convex/CLAUDE.md))

### Clerk
- **Redirect URLs**: Must match environment (localhost vs. production domain)
- **Webhooks**: Require `CLERK_WEBHOOK_SECRET` for signature validation
- **Billing**: Requires Clerk Billing enabled (currently commented out in some components)

### TypeScript
- **Import aliases**: Always use `@/` for root imports, never relative paths like `../../`
- **Generated types**: Import from `@/convex/_generated/api`, never edit generated files

### Styling
- **Tailwind v4**: Uses new `@theme` directive instead of `@layer`
- **Dark mode**: Handled via `class` strategy (not `media` query)
- **Design tokens**: Defined in [app/globals.css](app/globals.css), use semantic names

---

## Development Best Practices

### Solo Developer Tips
1. **Commit frequently** - Small, focused commits are easier to understand later
2. **Document decisions** - Add comments explaining "why" not "what"
3. **Use console logs liberally** - Debugging without a team to ask
4. **Keep PRD updated** - Update [docs/planning/siteview_360_prd.md](docs/planning/siteview_360_prd.md) as plans evolve
5. **Checkpoint progress** - Add checkpoint docs when reaching milestones

### Code Review Checklist (Self-Review)
Before committing a feature:
- [ ] TypeScript compiles without errors (`bun run typecheck`)
- [ ] ESLint passes (`bun lint`)
- [ ] Build succeeds (`bun build`)
- [ ] Tested manually in browser (happy path + error cases)
- [ ] No hardcoded secrets or API keys
- [ ] No `@ts-ignore` or `v.any()` without good reason
- [ ] Design tokens used (no hardcoded colors)
- [ ] `'use client'` added where needed

---

## Future Roadmap Items

### High Priority (from PRD)
- [ ] YouTube 360 video player integration
- [ ] SuperSplat (Gaussian splats) viewer
- [ ] Multi-platform embed support

### Technical Debt
- [ ] Set up testing framework (Vitest + Testing Library)
- [ ] Add E2E tests for critical flows
- [ ] Configure CI/CD pipeline (GitHub Actions)
- [ ] Add error boundary components
- [ ] Implement comprehensive error logging

### Quality of Life
- [ ] Add Prettier configuration
- [ ] Configure automated hooks (formatting, linting)
- [ ] Add pre-commit hooks (Husky)
- [ ] Set up Storybook for component development (optional)

---

## Questions or Stuck?

### Reference Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev)
- [Clerk Docs](https://clerk.com/docs)
- [Tailwind v4 Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

### Project-Specific Docs
- [Product Requirements](docs/planning/siteview_360_prd.md)
- [Development Plan](docs/planning/siteview_360_dev_plan.md)
- [Convex Webhook Events](convex/clerk-webhook-events-catalog.md)

### When to Ask for Help
- Architectural decisions (should this be a server or client component?)
- Complex TypeScript type issues
- Convex schema design questions
- Authentication flow problems
- Performance optimization questions

---

**Last Updated**: November 2024
**Status**: Early MVP Development
**Developer**: Solo (learning as building)
