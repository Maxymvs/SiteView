# AGENTS.md - Convex Backend

## Package Identity

**Purpose**: Serverless backend with real-time database, authentication, and webhook handlers  
**Tech**: Convex runtime, TypeScript, Clerk webhooks, Svix for webhook validation, Zod for validation

---

## Setup & Run

```bash
# Start Convex development server (required for local dev)
bunx convex dev

# Deploy to production
bunx convex deploy

# Run Convex dashboard
bunx convex dashboard

# Generate types (auto-runs with dev)
bunx convex codegen

# Clear all data (development only!)
bunx convex run --no-push clearAll
```

### Environment Variables

**In Convex Dashboard** (Settings → Environment Variables):
```bash
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-clerk-frontend-api.clerk.accounts.dev
```

---

## Patterns & Conventions

### File Organization

```
convex/
├── _generated/           # Auto-generated (DO NOT EDIT)
│   ├── api.ts           # Import this for API routes
│   ├── server.ts        # Import this for Convex functions
│   └── dataModel.d.ts   # TypeScript types for schema
├── schema.ts            # Database schema definition (START HERE)
├── users.ts             # User management functions
├── paymentAttempts.ts   # Payment tracking functions
├── paymentAttemptTypes.ts # Zod validators for payment data
├── http.ts              # HTTP endpoints & webhooks
├── auth.config.ts       # Clerk auth configuration
└── README.md            # Convex setup documentation
```

### Function Types

Convex has 4 main function types:

```tsx
// 1. QUERY - Read data (reactive, cached)
export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// 2. MUTATION - Write data (transactions)
export const createUser = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", { name: args.name });
  },
});

// 3. ACTION - Call external APIs, non-transactional
export const sendEmail = action({
  args: { to: v.string(), subject: v.string() },
  handler: async (ctx, args) => {
    // Can call external APIs here
    await fetch("https://api.sendgrid.com/...", { ... });
  },
});

// 4. INTERNAL MUTATION/QUERY - Only callable from backend
export const internalUpdate = internalMutation({
  args: { id: v.id("users"), name: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { name: args.name });
  },
});
```

### Schema Definition Pattern

**Reference**: `schema.ts`

```tsx
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ✅ DO: Define tables with validators
  users: defineTable({
    name: v.string(),
    externalId: v.string(),  // Clerk user ID
  }).index("byExternalId", ["externalId"]),  // Add indexes for queries
  
  // ✅ DO: Use imported validators for complex types
  paymentAttempts: defineTable(paymentAttemptSchemaValidator)
    .index("byPaymentId", ["payment_id"])
    .index("byUserId", ["userId"])
    .index("byPayerUserId", ["payer.user_id"]),
});

// Key points:
// - Always use v.* validators
// - Add indexes for fields you'll query by
// - Complex types can be imported from separate files
```

### Query Pattern

**Reference**: `users.ts`

```tsx
// ✅ DO: Export query with args validation
export const current = query({
  args: {},  // Empty if no args
  handler: async (ctx) => {
    // Get current user from auth context
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    // Query with index
    return await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();  // Returns single result or null
  },
});

// ✅ DO: Helper functions for reusability
async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}
```

### Mutation Pattern

**Reference**: `users.ts`, `paymentAttempts.ts`

```tsx
// ✅ DO: Internal mutations for webhook handlers
export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      externalId: data.id,
    };

    const user = await userByExternalId(ctx, data.id);
    
    // ✅ DO: Upsert pattern (update or insert)
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

// ✅ DO: Delete pattern
export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);
    if (user !== null) {
      await ctx.db.delete(user._id);
    }
  },
});
```

### HTTP Route & Webhook Pattern

**Reference**: `http.ts`

```tsx
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

// ✅ DO: Define HTTP routes
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // ✅ DO: Validate webhook signature
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occurred", { status: 400 });
    }
    
    // ✅ DO: Switch on event type
    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;
        
      case "user.deleted":
        await ctx.runMutation(internal.users.deleteFromClerk, { 
          clerkUserId: event.data.id 
        });
        break;
        
      case "paymentAttempt.updated":
        // Transform and save payment data
        const paymentData = transformWebhookData(event.data);
        await ctx.runMutation(internal.paymentAttempts.savePaymentAttempt, {
          paymentAttemptData: paymentData,
        });
        break;
        
      default:
        console.log("Ignored webhook event", event.type);
    }
    
    return new Response(null, { status: 200 });
  }),
});

// ✅ DO: Validate Svix signatures
async function validateRequest(req: Request) {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders);
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

export default http;
```

### Authentication Pattern

```tsx
// ✅ DO: Get current user with auth context
export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) return null;
  
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
    .unique();
}

// ✅ DO: Throw if user required
export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Can't get current user");
  return user;
}
```

---

## Touch Points / Key Files

### Core Files
- **Schema**: `schema.ts` - Database schema (START HERE for data model)
- **Auth config**: `auth.config.ts` - Clerk authentication setup
- **HTTP routes**: `http.ts` - Webhook handlers and public endpoints
- **Generated API**: `_generated/api.ts` - Import for calling functions from frontend

### Domain Logic
- **Users**: `users.ts` - User CRUD operations, Clerk sync
- **Payments**: `paymentAttempts.ts` - Payment tracking from Clerk billing
- **Payment types**: `paymentAttemptTypes.ts` - Zod validators and transformers

### Auto-Generated (DO NOT EDIT)
- `_generated/api.ts` - Function API for imports
- `_generated/server.ts` - Server-side utilities
- `_generated/dataModel.d.ts` - TypeScript types for schema

---

## JIT Index Hints

```bash
# List all Convex functions
ls convex/*.ts | grep -v _generated

# Find query definitions
rg -n "export const .* = query\(" convex/ --type ts

# Find mutation definitions
rg -n "export const .* = mutation\(" convex/ --type ts

# Find internal mutations (for webhooks)
rg -n "internalMutation" convex/ --type ts

# Find HTTP routes
rg -n "http.route" convex/ --type ts

# Find database queries
rg -n "ctx.db.query" convex/ --type ts

# Find auth usage
rg -n "ctx.auth.getUserIdentity" convex/ --type ts

# Find schema indexes
rg -n "\.index\(" convex/schema.ts
```

---

## Common Gotchas

- **Generated files**: Never edit `_generated/*` - they're auto-generated by Convex
- **Environment variables**: Must be set in Convex dashboard, not just `.env.local`
- **Webhook secrets**: `CLERK_WEBHOOK_SECRET` must match Clerk dashboard webhook settings
- **Internal mutations**: Can only be called from backend (webhooks, actions) - not from frontend
- **Indexes required**: Queries with `withIndex()` require matching index in schema
- **Auth context**: `ctx.auth.getUserIdentity()` returns `null` for unauthenticated requests
- **Transaction boundaries**: Queries can't modify data, mutations can't call external APIs
- **Unique vs Collect**: `.unique()` returns single item or null, `.collect()` returns array

---

## Examples to Follow

### Adding a New Table

1. **Define schema** in `schema.ts`:
```tsx
posts: defineTable({
  title: v.string(),
  content: v.string(),
  authorId: v.id("users"),
  createdAt: v.number(),
}).index("byAuthor", ["authorId"])
  .index("byCreatedAt", ["createdAt"]),
```

2. **Create functions** in `posts.ts`:
```tsx
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("posts").order("desc").take(10);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db.insert("posts", {
      ...args,
      authorId: user._id,
      createdAt: Date.now(),
    });
  },
});
```

3. **Use in frontend**:
```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function PostList() {
  const posts = useQuery(api.posts.list);
  const createPost = useMutation(api.posts.create);
  
  // ...
}
```

### Querying with Relationships

```tsx
// ✅ DO: Manual joins (Convex doesn't have automatic joins)
export const getPostsWithAuthors = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();
    
    // Fetch related users
    return await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return { ...post, author };
      })
    );
  },
});
```

### Webhook Handler Pattern

```tsx
// In http.ts:
http.route({
  path: "/your-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Parse request
    const body = await request.json();
    
    // 2. Validate (signature, shape, etc.)
    if (!isValid(body)) {
      return new Response("Invalid", { status: 400 });
    }
    
    // 3. Call internal mutation
    await ctx.runMutation(internal.yourModule.processWebhook, {
      data: body,
    });
    
    // 4. Return success
    return new Response(null, { status: 200 });
  }),
});
```

---

## Pre-PR Checks

```bash
# Ensure Convex is running
bunx convex dev

# Check for TypeScript errors
bunx tsc --noEmit --project convex/tsconfig.json

# Verify schema is valid (Convex dev will error if not)

# Test webhooks locally:
# 1. Use Clerk webhook testing UI
# 2. Or use curl/Postman with proper Svix headers

# Verify functions work:
# 1. Test queries/mutations from frontend
# 2. Check Convex dashboard logs for errors
```

---

## Convex Best Practices

### Performance
- ✅ **DO**: Use indexes for queries (add to schema)
- ✅ **DO**: Paginate large result sets with `.paginate()`
- ✅ **DO**: Use `.order("desc")` and `.take(N)` for recent items
- ❌ **DON'T**: Load all data with `.collect()` on large tables

### Data Modeling
- ✅ **DO**: Use `v.id("tableName")` for foreign keys
- ✅ **DO**: Add indexes for all fields you query by
- ✅ **DO**: Store timestamps as numbers (`Date.now()`)
- ❌ **DON'T**: Use strings for IDs (use Convex IDs)

### Security
- ✅ **DO**: Validate all input with `v.*` validators
- ✅ **DO**: Check auth in every mutation that modifies user data
- ✅ **DO**: Use `internalMutation` for webhook handlers
- ❌ **DON'T**: Trust client input without validation
- ❌ **DON'T**: Expose internal mutations to frontend

### Error Handling
```tsx
// ✅ DO: Throw errors for client to handle
if (!user) {
  throw new Error("User not found");
}

// ✅ DO: Log warnings for non-critical issues
if (!optional) {
  console.warn("Optional data missing");
}
```

---

## Debugging

### Convex Dashboard
- View logs: `bunx convex dashboard` → Logs tab
- Query data: Dashboard → Data tab
- Test functions: Dashboard → Functions tab

### Local Debugging
```tsx
// ✅ DO: Use console.log in Convex functions
console.log("Debug:", { user, data });

// Logs appear in Convex dev server terminal
```

### Common Errors
- **"No index for query"**: Add index to schema.ts
- **"Function not found"**: Run `bunx convex dev` to regenerate
- **"Auth required"**: User not authenticated, handle null identity
- **"Webhook validation failed"**: Check `CLERK_WEBHOOK_SECRET` in Convex dashboard

---

## Documentation

- **Convex docs**: https://docs.convex.dev/
- **Clerk webhooks**: https://clerk.com/docs/webhooks
- **Svix validation**: https://docs.svix.com/receiving/verifying-payloads
