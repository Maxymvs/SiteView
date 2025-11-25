# Convex Backend - Database & Serverless Functions

**Technology**: Convex (TypeScript-based serverless backend)
**Entry Point**: [convex/schema.ts](schema.ts)
**Parent Context**: This extends [../CLAUDE.md](../CLAUDE.md)

---

## Overview

Convex provides the entire backend infrastructure for SiteView:
- **Real-time database** with automatic TypeScript types
- **Serverless functions** (queries, mutations, actions)
- **Authentication** via Clerk JWT integration
- **Webhooks** for external service integration (Clerk events, payment updates)
- **File storage** (not yet implemented, but available)

**Key Benefit**: Changes to schema/functions are immediately available with hot reloading during development.

---

## Development Commands

### Convex CLI
```bash
# Start Convex development (run in separate terminal)
bunx convex dev

# Deploy to production
bunx convex deploy

# View database dashboard
bunx convex dashboard

# Run a query from CLI
bunx convex run users:current

# Import data
bunx convex import --table users data.jsonl

# Export data
bunx convex export --table users --output data.jsonl
```

### From Root Directory
```bash
# Type check Convex functions
bunx tsc --noEmit --project convex/tsconfig.json

# Watch Convex logs
bunx convex logs --watch
```

### Environment Setup
Required environment variables (in `.env.local`):
```bash
CONVEX_DEPLOYMENT=prod:<deployment-id>
NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud
CLERK_WEBHOOK_SECRET=whsec_...  # For webhook signature validation
```

---

## Architecture

### Directory Structure
```
convex/
├── schema.ts                        # Database schema (tables, indexes)
├── auth.config.ts                   # Clerk JWT authentication config
├── http.ts                          # HTTP endpoints (webhooks)
├── users.ts                         # User queries & mutations
├── paymentAttempts.ts              # Payment tracking
├── paymentAttemptTypes.ts          # Payment data validation
├── tsconfig.json                    # Convex-specific TypeScript config
├── _generated/                      # Auto-generated (DO NOT EDIT)
│   ├── api.d.ts                    # API types for frontend
│   ├── api.js                      # API runtime
│   ├── server.d.ts                 # Server-side types
│   ├── server.js                   # Server runtime
│   └── dataModel.d.ts              # Database table types
├── README.md                        # Convex setup instructions
├── AGENTS.md                        # Legacy agent guidance
├── clerk-webhook-events-catalog.md # Webhook event documentation
└── CLAUDE.md                        # This file
```

### Data Flow
```
Frontend (React)
  ↓ useQuery/useMutation
Convex API (_generated/api)
  ↓
Convex Functions (queries/mutations)
  ↓ ctx.db.query/insert/patch/delete
Database (schema.ts)
```

```
External Service (Clerk)
  ↓ Webhook HTTP POST
http.ts endpoint
  ↓ Webhook validation
Internal Mutation
  ↓
Database Update
```

---

## Core Concepts

### 1. Schema Definition

**File**: [schema.ts](schema.ts)

Defines database tables with validation and indexes:

```typescript
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    name: v.string(),
    externalId: v.string(), // Clerk user ID
  }).index('externalId', ['externalId']), // Fast lookup by Clerk ID

  paymentAttempts: defineTable({
    payment_id: v.string(),
    userId: v.id('users'),
    payer: v.object({
      user_id: v.string(),
    }),
    // ... more fields
  })
    .index('payment_id', ['payment_id'])
    .index('userId', ['userId'])
    .index('payer_user_id', ['payer.user_id']),
})
```

**Key Points**:
- ✅ **DO** define explicit types (never use `v.any()`)
- ✅ **DO** add indexes for fields you query by
- ✅ **DO** use `v.id('tableName')` for foreign keys
- ❌ **DON'T** use `v.any()` - it breaks type safety
- ❌ **DON'T** forget indexes - queries without indexes are slow

**Common Types**:
- `v.string()` - String
- `v.number()` - Number
- `v.boolean()` - Boolean
- `v.id('tableName')` - Reference to another table
- `v.object({ field: v.string() })` - Nested object
- `v.array(v.string())` - Array
- `v.optional(v.string())` - Optional field
- `v.union(v.string(), v.null())` - Union type

### 2. Queries (Read Data)

**File**: [users.ts](users.ts)

Queries fetch data from the database:

```typescript
import { query } from './_generated/server'

export const current = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user from Clerk JWT
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    // Query database
    const user = await ctx.db
      .query('users')
      .withIndex('externalId', (q) => q.eq('externalId', identity.subject))
      .unique()

    return user
  },
})
```

**Key Points**:
- ✅ Queries are read-only (cannot modify data)
- ✅ Use `ctx.auth.getUserIdentity()` for auth
- ✅ Use indexes for efficient queries (`.withIndex()`)
- ✅ Return `null` for not found, `undefined` for loading (frontend side)
- ❌ **DON'T** perform side effects in queries (use mutations instead)

### 3. Mutations (Write Data)

**File**: [users.ts](users.ts)

Mutations create, update, or delete data:

```typescript
import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const upsertFromClerk = mutation({
  args: {
    externalId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Find existing user
    const existingUser = await ctx.db
      .query('users')
      .withIndex('externalId', (q) => q.eq('externalId', args.externalId))
      .unique()

    if (existingUser) {
      // Update existing
      await ctx.db.patch(existingUser._id, {
        name: args.name,
      })
      return existingUser._id
    } else {
      // Create new
      const userId = await ctx.db.insert('users', {
        externalId: args.externalId,
        name: args.name,
      })
      return userId
    }
  },
})
```

**Key Points**:
- ✅ Mutations can read and write data
- ✅ Mutations are atomic (all or nothing)
- ✅ Use `ctx.db.insert()` to create
- ✅ Use `ctx.db.patch()` to update
- ✅ Use `ctx.db.delete()` to remove
- ✅ Validate args with `v.*` validators
- ❌ **DON'T** call external APIs directly (use actions instead)

### 4. Internal Mutations

**Pattern**: Mutations prefixed with `internal` are only callable from server:

```typescript
import { internalMutation } from './_generated/server'

export const upsertFromClerk = internalMutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // Only callable from http.ts webhooks or other server-side functions
    // NOT callable from frontend
  },
})
```

**Use Cases**:
- Webhook handlers (Clerk user sync)
- Background jobs
- Admin operations
- Anything that shouldn't be called directly from frontend

### 5. HTTP Endpoints (Webhooks)

**File**: [http.ts](http.ts)

HTTP endpoints receive webhooks from external services:

```typescript
import { httpRouter } from 'convex/server'
import { Webhook } from 'svix'
import { internal } from './_generated/api'

const http = httpRouter()

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: async (ctx, request) => {
    // Validate webhook signature
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) throw new Error('Missing CLERK_WEBHOOK_SECRET')

    const svix = new Webhook(webhookSecret)
    const payload = await request.text()
    const headers = request.headers

    // Verify signature
    const evt = svix.verify(payload, {
      'svix-id': headers.get('svix-id')!,
      'svix-timestamp': headers.get('svix-timestamp')!,
      'svix-signature': headers.get('svix-signature')!,
    })

    // Handle event
    const eventType = evt.type
    if (eventType === 'user.created' || eventType === 'user.updated') {
      await ctx.runMutation(internal.users.upsertFromClerk, {
        externalId: evt.data.id,
        name: `${evt.data.first_name ?? ''} ${evt.data.last_name ?? ''}`.trim(),
      })
    }

    return new Response(null, { status: 200 })
  },
})

export default http
```

**Key Points**:
- ✅ Always validate webhook signatures (security!)
- ✅ Use `internal` mutations for data updates
- ✅ Return proper HTTP status codes
- ✅ Handle errors gracefully
- ❌ **DON'T** skip signature validation
- ❌ **DON'T** expose sensitive data in error messages

---

## Common Patterns

### Pattern 1: User-Scoped Queries

**Fetch data for current authenticated user only**:

```typescript
export const listMyVideos = query({
  args: {},
  handler: async (ctx) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    // Find user in database
    const user = await ctx.db
      .query('users')
      .withIndex('externalId', (q) => q.eq('externalId', identity.subject))
      .unique()

    if (!user) return []

    // Query videos for this user
    const videos = await ctx.db
      .query('videos')
      .withIndex('userId', (q) => q.eq('userId', user._id))
      .collect()

    return videos
  },
})
```

### Pattern 2: Paginated Queries

**For large datasets, use pagination**:

```typescript
export const listVideosPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { page: [], continueCursor: null, isDone: true }

    const user = await ctx.db
      .query('users')
      .withIndex('externalId', (q) => q.eq('externalId', identity.subject))
      .unique()

    if (!user) return { page: [], continueCursor: null, isDone: true }

    // Paginated query
    return await ctx.db
      .query('videos')
      .withIndex('userId', (q) => q.eq('userId', user._id))
      .order('desc') // Newest first
      .paginate(args.paginationOpts)
  },
})
```

### Pattern 3: Creating Related Records

**Create record with foreign key reference**:

```typescript
export const createVideo = mutation({
  args: {
    title: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const user = await ctx.db
      .query('users')
      .withIndex('externalId', (q) => q.eq('externalId', identity.subject))
      .unique()

    if (!user) throw new Error('User not found')

    // Create video record
    const videoId = await ctx.db.insert('videos', {
      userId: user._id, // Foreign key
      title: args.title,
      url: args.url,
      createdAt: Date.now(),
    })

    return videoId
  },
})
```

### Pattern 4: Upserting (Insert or Update)

**Pattern used in [users.ts](users.ts:35-50)**:

```typescript
export const upsert = mutation({
  args: {
    externalId: v.string(),
    data: v.object({ /* ... */ }),
  },
  handler: async (ctx, args) => {
    // Try to find existing
    const existing = await ctx.db
      .query('table')
      .withIndex('externalId', (q) => q.eq('externalId', args.externalId))
      .unique()

    if (existing) {
      // Update
      await ctx.db.patch(existing._id, args.data)
      return existing._id
    } else {
      // Insert
      return await ctx.db.insert('table', {
        externalId: args.externalId,
        ...args.data,
      })
    }
  },
})
```

### Pattern 5: Soft Deletes

**Mark records as deleted instead of removing them**:

```typescript
// Add to schema
videos: defineTable({
  // ... fields
  deletedAt: v.optional(v.number()),
}).index('userId', ['userId'])

// Soft delete mutation
export const deleteVideo = mutation({
  args: { id: v.id('videos') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    // Verify ownership
    const video = await ctx.db.get(args.id)
    if (!video) throw new Error('Video not found')

    const user = await ctx.db
      .query('users')
      .withIndex('externalId', (q) => q.eq('externalId', identity.subject))
      .unique()

    if (video.userId !== user?._id) {
      throw new Error('Not authorized')
    }

    // Soft delete
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
    })
  },
})

// Filter out deleted in queries
export const listVideos = query({
  args: {},
  handler: async (ctx) => {
    // ... get user

    const videos = await ctx.db
      .query('videos')
      .withIndex('userId', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined)) // Exclude deleted
      .collect()

    return videos
  },
})
```

---

## Quick Search Commands

### Find Functions
```bash
# Find all queries
rg -n "export const \w+ = query" convex/

# Find all mutations
rg -n "export const \w+ = mutation" convex/

# Find internal functions
rg -n "export const \w+ = internal(Query|Mutation)" convex/

# Find HTTP endpoints
rg -n "http\.route" convex/
```

### Find Database Operations
```bash
# Find inserts
rg -n "ctx\.db\.insert" convex/

# Find updates
rg -n "ctx\.db\.patch" convex/

# Find deletes
rg -n "ctx\.db\.delete" convex/

# Find queries
rg -n "ctx\.db\.query" convex/
```

### Find Indexes
```bash
# Find all indexes
rg -n "\.index\(" convex/schema.ts

# Find index usage
rg -n "\.withIndex\(" convex/
```

### Find Auth Usage
```bash
# Find auth checks
rg -n "ctx\.auth\.getUserIdentity" convex/

# Find user lookups
rg -n "externalId.*identity\.subject" convex/
```

---

## Common Gotchas

### 1. Using `v.any()` in Schema

**Problem**: Breaks type safety and auto-completion

```typescript
// ❌ DON'T - Found in users.ts:13
data: v.any()

// ✅ DO - Define explicit schema
data: v.object({
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
})

// ✅ OR for truly dynamic data, use v.object with known fields
metadata: v.optional(v.object({
  key: v.string(),
  value: v.union(v.string(), v.number(), v.boolean()),
}))
```

### 2. Forgetting Indexes

**Problem**: Slow queries without indexes

```typescript
// ❌ DON'T - Slow without index
const user = await ctx.db
  .query('users')
  .filter((q) => q.eq(q.field('email'), email)) // Full table scan!
  .unique()

// ✅ DO - Add index in schema.ts
users: defineTable({
  email: v.string(),
}).index('email', ['email'])

// ✅ Then use index
const user = await ctx.db
  .query('users')
  .withIndex('email', (q) => q.eq('email', email)) // Fast!
  .unique()
```

### 3. Not Checking Authentication

**Problem**: Unauthorized access to data

```typescript
// ❌ DON'T - No auth check
export const getUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId) // Anyone can read any user!
  },
})

// ✅ DO - Check authentication and authorization
export const getUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const user = await ctx.db.get(args.userId)
    if (!user) return null

    // Check if current user is authorized
    if (user.externalId !== identity.subject) {
      throw new Error('Not authorized')
    }

    return user
  },
})
```

### 4. Calling Mutations from Queries

**Problem**: Queries are read-only

```typescript
// ❌ DON'T - Cannot mutate in query
export const trackView = query({
  args: { videoId: v.id('videos') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.videoId, { views: /* ... */ }) // ERROR!
  },
})

// ✅ DO - Use mutation for writes
export const trackView = mutation({
  args: { videoId: v.id('videos') },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId)
    if (!video) throw new Error('Video not found')

    await ctx.db.patch(args.videoId, {
      views: (video.views ?? 0) + 1,
    })
  },
})
```

### 5. Not Validating Webhook Signatures

**Problem**: Security vulnerability

```typescript
// ❌ DON'T - Accept any webhook
http.route({
  path: '/webhook',
  method: 'POST',
  handler: async (ctx, request) => {
    const data = await request.json()
    await ctx.runMutation(internal.users.update, data) // Unsafe!
  },
})

// ✅ DO - Validate signature (see http.ts)
http.route({
  path: '/webhook',
  method: 'POST',
  handler: async (ctx, request) => {
    const secret = process.env.WEBHOOK_SECRET
    if (!secret) throw new Error('Missing secret')

    const svix = new Webhook(secret)
    const payload = await request.text()

    // This will throw if signature invalid
    const evt = svix.verify(payload, {
      'svix-id': request.headers.get('svix-id')!,
      'svix-timestamp': request.headers.get('svix-timestamp')!,
      'svix-signature': request.headers.get('svix-signature')!,
    })

    // Now safe to process
    await ctx.runMutation(internal.users.update, evt.data)
  },
})
```

### 6. Forgetting to Handle Loading States

**Frontend issue when using Convex queries**:

```tsx
// ❌ DON'T - Will crash during loading
function Component() {
  const user = useQuery(api.users.current)
  return <div>{user.name}</div> // user is undefined initially!
}

// ✅ DO - Handle loading state
function Component() {
  const user = useQuery(api.users.current)

  if (user === undefined) return <div>Loading...</div>
  if (user === null) return <div>Not found</div>

  return <div>{user.name}</div>
}
```

---

## Schema Evolution

### Adding New Tables

1. **Update [schema.ts](schema.ts)**:
```typescript
export default defineSchema({
  // ... existing tables
  videos: defineTable({
    userId: v.id('users'),
    title: v.string(),
    url: v.string(),
    createdAt: v.number(),
  })
    .index('userId', ['userId'])
    .index('createdAt', ['createdAt']),
})
```

2. **Convex auto-generates types** (no migration needed!)
3. **Create corresponding functions** in `convex/videos.ts`

### Adding Fields to Existing Tables

1. **Add field to schema with `v.optional()`**:
```typescript
users: defineTable({
  name: v.string(),
  externalId: v.string(),
  avatarUrl: v.optional(v.string()), // New optional field
})
```

2. **Deploy schema change**: `bunx convex deploy` (or auto-deploys in dev)
3. **Existing records will have `undefined` for new field**
4. **Optional**: Run data migration to populate field

### Removing Fields

1. **Remove from schema** (existing data remains in database)
2. **Optional**: Clean up old data with migration function

### Adding Indexes

1. **Add to schema**:
```typescript
users: defineTable({
  // ... fields
})
  .index('externalId', ['externalId'])
  .index('email', ['email']) // New index
```

2. **Convex builds index automatically** (may take time for large tables)

---

## Testing Convex Functions

### Manual Testing via Dashboard

1. Open Convex dashboard: `bunx convex dashboard`
2. Navigate to "Functions" tab
3. Select function to test
4. Provide arguments as JSON
5. Click "Run"

### Testing from CLI

```bash
# Run a query
bunx convex run users:current

# Run with arguments
bunx convex run videos:get --id "j5768k8k7h2h3h4h5h6h7h8h9"

# Run mutation
bunx convex run users:update --userId "..." --name "Test User"
```

### Testing Webhooks Locally

Use tools like `ngrok` to expose local dev server:

```bash
# 1. Start Convex dev
bunx convex dev

# 2. Expose local server
npx ngrok http 3000

# 3. Configure webhook in Clerk dashboard
# URL: https://<ngrok-url>/clerk-users-webhook

# 4. Trigger event in Clerk (create test user)
# 5. Check logs: bunx convex logs --watch
```

### Future: Unit Tests

When ready to add testing:

```typescript
// convex/users.test.ts (future)
import { expect, test } from 'vitest'
import { convexTest } from 'convex-test'
import schema from './schema'
import { current } from './users'

test('current query returns authenticated user', async () => {
  const t = convexTest(schema)

  // Insert test data
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert('users', {
      name: 'Test User',
      externalId: 'clerk_123',
    })
  })

  // Mock auth
  t.withIdentity({ subject: 'clerk_123' })

  // Run query
  const user = await t.query(current, {})

  expect(user).toBeDefined()
  expect(user?.name).toBe('Test User')
})
```

---

## Integration with Frontend

### Importing API

```tsx
import { api } from '@/convex/_generated/api'
import { useQuery, useMutation } from 'convex/react'
```

### Query Pattern

```tsx
function Component() {
  const videos = useQuery(api.videos.list)
  // videos is undefined during loading
  // videos is null if not authenticated
  // videos is array of videos when loaded
}
```

### Mutation Pattern

```tsx
function Component() {
  const createVideo = useMutation(api.videos.create)

  const handleCreate = async () => {
    try {
      const id = await createVideo({
        title: 'My Video',
        url: 'https://...',
      })
      console.log('Created video:', id)
    } catch (err) {
      console.error('Failed to create:', err)
    }
  }

  return <button onClick={handleCreate}>Create Video</button>
}
```

### Optimistic Updates

```tsx
function Component() {
  const videos = useQuery(api.videos.list) ?? []
  const deleteVideo = useMutation(api.videos.delete)

  const handleDelete = async (id: Id<'videos'>) => {
    // Optimistically remove from UI
    const optimisticVideos = videos.filter((v) => v._id !== id)
    // (Use local state or React Query for actual optimistic updates)

    try {
      await deleteVideo({ id })
    } catch (err) {
      // Revert on error
      console.error('Delete failed:', err)
    }
  }
}
```

---

## Performance Best Practices

### 1. Use Indexes

```typescript
// ❌ Slow - Full table scan
.filter((q) => q.eq(q.field('userId'), userId))

// ✅ Fast - Index lookup
.withIndex('userId', (q) => q.eq('userId', userId))
```

### 2. Paginate Large Queries

```typescript
// ❌ Don't load entire table
const allVideos = await ctx.db.query('videos').collect()

// ✅ Use pagination
const page = await ctx.db.query('videos').paginate(paginationOpts)
```

### 3. Avoid N+1 Queries

```typescript
// ❌ DON'T - N+1 queries
const videos = await ctx.db.query('videos').collect()
const videosWithUsers = await Promise.all(
  videos.map(async (video) => ({
    ...video,
    user: await ctx.db.get(video.userId), // N queries!
  }))
)

// ✅ DO - Batch fetch users
const videos = await ctx.db.query('videos').collect()
const userIds = [...new Set(videos.map((v) => v.userId))]
const users = await Promise.all(userIds.map((id) => ctx.db.get(id)))
const userMap = Object.fromEntries(users.map((u) => [u!._id, u]))

const videosWithUsers = videos.map((video) => ({
  ...video,
  user: userMap[video.userId],
}))
```

### 4. Cache Expensive Computations

For computations that don't change often, consider caching:

```typescript
// Store computed results in database
computedMetrics: defineTable({
  userId: v.id('users'),
  totalViews: v.number(),
  lastComputed: v.number(),
}).index('userId', ['userId'])

// Recompute periodically (via scheduled function or on-demand)
```

---

## Related Documentation

- **Root guidelines**: [../CLAUDE.md](../CLAUDE.md)
- **Dashboard integration**: [../app/dashboard/CLAUDE.md](../app/dashboard/CLAUDE.md)
- **Convex documentation**: https://docs.convex.dev
- **Clerk webhook events**: [clerk-webhook-events-catalog.md](clerk-webhook-events-catalog.md)

---

**Last Updated**: November 2024
**Status**: Basic user and payment tracking implemented
**Next Steps**: Add videos table, splats table, and related queries/mutations
