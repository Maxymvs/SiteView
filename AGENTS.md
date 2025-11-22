# AGENTS.md - SiteView (Elite Next.js SaaS Starter)

## Project Snapshot

**Type**: Single Next.js 15 application with App Router  
**Stack**: Next.js 15, React 19, TypeScript (strict), Tailwind v4, Convex, Clerk  
**Structure**: Organized by feature with sub-folder AGENTS.md files for detailed guidance

---

## Root Setup Commands

```bash
# Install dependencies (supports npm/pnpm/yarn/bun)
bun install

# Start development server with Turbopack
bun run dev

# Start Convex backend in separate terminal
bunx convex dev

# Build for production
bun run build

# Lint
bun run lint
```

---

## Universal Conventions

### Code Style
- **TypeScript**: Strict mode enabled, no implicit any
- **Imports**: Always use `@/` absolute imports (configured in tsconfig.json)
- **Formatting**: Follow existing patterns (functional components, arrow functions)
- **Components**: Use CVA (class-variance-authority) for variants, see `components/ui/button.tsx`

### Commit Format
- Follow existing commit style: lowercase, descriptive (see `git log --oneline -5`)
- Examples: "hero section picture + cleaned up unusused components", "styling improvements"

### Branch Strategy
- Main branch: `main` (default)
- Create feature branches for new work

### PR Requirements
- Code must lint: `bun run lint`
- Build must succeed: `bun run build`
- No TypeScript errors: Check with IDE or `tsc --noEmit`

---

## Security & Secrets

- **Never commit**: API keys, tokens, or secrets to git
- **Environment files**: Use `.env.local` (gitignored), see `.env.example` for template
- **Clerk secrets**: Store in both `.env.local` AND Convex dashboard env vars
- **Webhook secrets**: Never expose `CLERK_WEBHOOK_SECRET` in client code
- **PII handling**: User data synced via Convex, always use Clerk's `externalId` pattern

---

## JIT Index - Directory Map

### Application Structure
- **Landing pages**: `app/(landing)/` → [see app/(landing)/AGENTS.md](app/(landing)/AGENTS.md)
- **Dashboard**: `app/dashboard/` → [see app/dashboard/AGENTS.md](app/dashboard/AGENTS.md)
- **Root layout & middleware**: `app/layout.tsx`, `middleware.ts` (route protection logic)

### Component Libraries
- **UI Components**: `components/ui/` → [see components/AGENTS.md](components/AGENTS.md)
- **Custom components**: `components/*.tsx` (Logo, ThemeProvider, ConvexClientProvider)
- **Third-party**: `components/kokonutui/`, `components/magicui/`, `components/motion-primitives/`, `components/react-bits/`

### Backend & Data
- **Convex backend**: `convex/` → [see convex/AGENTS.md](convex/AGENTS.md)
- **Database schema**: `convex/schema.ts`
- **Webhooks**: `convex/http.ts`

### Utilities
- **Shared utilities**: `lib/utils.ts` (cn helper for Tailwind)
- **Custom hooks**: `hooks/use-mobile.ts`

### Quick Find Commands
```bash
# Find a component by name
rg -n "export.*ComponentName" components/ app/

# Find a React hook
rg -n "export const use" hooks/

# Find API route handlers (App Router)
rg -n "export async function (GET|POST)" app/

# Find Convex functions
rg -n "export (const|default)" convex/ --type ts

# Find shadcn/ui component usage
rg -n "from \"@/components/ui" --type tsx

# Find Clerk authentication usage
rg -n "useAuth|useUser|auth\(\)" --type tsx
```

---

## Definition of Done

Before marking work complete or creating a PR:

- [ ] Code lints without errors: `bun run lint`
- [ ] TypeScript compiles: `tsc --noEmit` or check IDE
- [ ] Build succeeds: `bun run build`
- [ ] All imports use `@/` absolute paths
- [ ] No secrets or API keys committed
- [ ] Components follow existing patterns (see examples in respective AGENTS.md files)

---

## Architecture Notes

- **Authentication**: Clerk handles all auth, user data synced to Convex via webhooks
- **Protected Routes**: Middleware in `middleware.ts` protects `/dashboard(.*)` routes
- **Real-time Data**: Convex provides reactive queries, no manual refetching needed
- **Styling**: Tailwind v4 with CSS variables for theming, see `app/globals.css`
- **Fonts**: Geist Sans & Geist Mono loaded via Next.js font optimization

---

## Testing (Not Yet Implemented)

**Recommendation**: Add testing framework (Vitest or Jest + React Testing Library)

Suggested structure:
- Unit tests: Colocate with source files (`*.test.ts`, `*.test.tsx`)
- Integration tests: `__tests__/integration/`
- E2E tests: `__tests__/e2e/` (Playwright recommended)
