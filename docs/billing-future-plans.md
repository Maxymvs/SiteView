# Billing Implementation - Future Plans

**Status:** Not implemented yet (Clerk Billing components currently commented out)  
**Decision:** Focusing on core product features first, billing to be added later  
**Last Updated:** November 22, 2025

---

## 📊 Current State

### What's Already Set Up
- ✅ **Clerk Authentication** - Fully working (users, sign-in/sign-up, protected routes)
- ✅ **Convex Database** - User management with Clerk webhooks
- ✅ **Payment Infrastructure Skeleton**:
  - `convex/paymentAttempts.ts` - Payment tracking logic (Clerk Billing specific)
  - `convex/paymentAttemptTypes.ts` - Payment data validators (Clerk Billing specific)
  - `components/custom-clerk-pricing.tsx` - Clerk pricing table component (commented out)
  - `app/dashboard/payment-gated/page.tsx` - Example payment gate using `<Protect>`

### What's Commented Out
- 🔕 Clerk `<PricingTable />` component on landing page
- 🔕 Clerk `<PricingTable />` component on payment-gated page
- 🔕 Clerk Billing webhook handler in `convex/http.ts` (event type: `paymentAttempt.updated`)

---

## 🎯 Two Billing Options for the Future

When you're ready to implement billing, you have two main options:

### **Option 1: Clerk Billing** (Current Default)
**Website:** https://clerk.com/docs/billing/overview

#### Pros
- ✅ Already integrated with your auth system
- ✅ Single vendor for auth + billing
- ✅ Built-in `<PricingTable />` component
- ✅ Built-in `<Protect>` component for plan-based authorization
- ✅ Webhook infrastructure already in place
- ✅ Some code already written (`paymentAttempts.ts`, `paymentAttemptTypes.ts`)

#### Cons
- ❌ Less flexible than dedicated billing platforms
- ❌ Newer product (less battle-tested than Stripe/Paddle)
- ❌ Limited to Clerk's billing feature set
- ❌ Pricing might be higher for high-volume apps

#### Effort to Implement
**Time:** 1-2 days

**Steps:**
1. Enable Clerk Billing in dashboard: https://dashboard.clerk.com/last-active?path=billing/settings
2. Set up pricing plans in Clerk dashboard
3. Uncomment pricing table components:
   - `app/(landing)/page.tsx` (lines 7, 14-22)
   - `app/dashboard/payment-gated/page.tsx` (lines 2, 11-13)
4. Add webhook secret to Convex dashboard: `CLERK_WEBHOOK_SECRET`
5. Test payment flow end-to-end

---

### **Option 2: Polar.sh** (Alternative - Developer-Friendly)
**Website:** https://polar.sh

#### Pros
- ✅ Developer-first billing platform (made by developers for developers)
- ✅ Built for SaaS/subscriptions
- ✅ Clean API and webhooks
- ✅ Good documentation
- ✅ Fair pricing model
- ✅ Supports GitHub sponsorships integration
- ✅ Built-in affiliate/creator features

#### Cons
- ❌ Requires custom integration (no drop-in components like Clerk)
- ❌ Need to build your own pricing UI
- ❌ Need to build subscription checking logic
- ❌ More code to write and maintain

#### Effort to Implement
**Time:** 1-2 weeks (full migration from Clerk Billing skeleton)

---

## 🔄 Migration Strategy: Clerk Billing → Polar.sh

**Note:** Since billing isn't live yet, this is the **perfect time** to switch if you prefer Polar!

### Decision Point: Authentication Strategy

#### **Recommended: Keep Clerk Auth + Add Polar Billing**

**Architecture:**
```
Clerk (Auth) → User signs up/logs in
     ↓
Your App → Links Clerk user to Polar subscription
     ↓
Polar (Billing) → Handles payments, sends webhooks
     ↓
Convex → Stores subscription status, checks access
```

**Linking Strategy:**
- Store Polar customer ID in `users` table
- Match subscriptions by email
- Or: Use Clerk's user metadata to store Polar customer ID

### Phase 1: Frontend Changes (1-2 days)

#### 1. Remove Clerk Billing Components
```bash
# Delete or archive these files:
- components/custom-clerk-pricing.tsx
- convex/paymentAttempts.ts
- convex/paymentAttemptTypes.ts
```

#### 2. Create Polar Pricing Component
```tsx
// components/polar-pricing.tsx
'use client'

export default function PolarPricing() {
  return (
    <div>
      {/* Embed Polar checkout or build custom pricing UI */}
      {/* Polar provides embeddable checkout: */}
      {/* https://docs.polar.sh/checkout/embed */}
    </div>
  )
}
```

#### 3. Create Subscription Check Component
```tsx
// components/paid-feature.tsx
'use client'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function PaidFeature({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback: React.ReactNode 
}) {
  const subscription = useQuery(api.subscriptions.getCurrentUserSubscription)
  
  if (!subscription || subscription.status !== 'active') {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
```

### Phase 2: Backend Schema Changes (2-3 days)

#### 1. Update Database Schema
```typescript
// convex/schema.ts
export default defineSchema({
  users: defineTable({
    name: v.string(),
    externalId: v.string(), // Clerk ID
    polarCustomerId: v.optional(v.string()), // Link to Polar
  }).index("byExternalId", ["externalId"])
    .index("byPolarCustomerId", ["polarCustomerId"]),
  
  subscriptions: defineTable({
    userId: v.id("users"),
    polarSubscriptionId: v.string(),
    polarProductId: v.string(),
    status: v.string(), // active, canceled, past_due, etc.
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    plan: v.object({
      id: v.string(),
      name: v.string(),
      amount: v.number(),
      currency: v.string(),
      interval: v.string(), // month, year
    }),
  })
    .index("byUserId", ["userId"])
    .index("byPolarSubscriptionId", ["polarSubscriptionId"])
    .index("byStatus", ["status"]),
})
```

#### 2. Create Subscription Queries
```typescript
// convex/subscriptions.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUserSubscription = query({
  args: {},
  returns: v.union(v.null(), v.object({
    status: v.string(),
    plan: v.object({
      name: v.string(),
      // ... other fields
    }),
    // ... other fields
  })),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    
    if (!user) return null;
    
    return await ctx.db
      .query("subscriptions")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

export const hasActiveSubscription = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const subscription = await getCurrentUserSubscription(ctx, {});
    return subscription !== null && subscription.status === "active";
  },
});
```

### Phase 3: Webhook Integration (1-2 days)

#### 1. Add Polar Webhook Endpoint
```typescript
// convex/http.ts
http.route({
  path: "/polar-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validatePolarWebhook(request);
    if (!event) {
      return new Response("Invalid signature", { status: 400 });
    }
    
    switch (event.type) {
      case "subscription.created":
      case "subscription.updated":
        await ctx.runMutation(internal.subscriptions.upsertSubscription, {
          data: event.data,
        });
        break;
        
      case "subscription.canceled":
        await ctx.runMutation(internal.subscriptions.cancelSubscription, {
          subscriptionId: event.data.id,
        });
        break;
        
      default:
        console.log("Ignored Polar webhook event", event.type);
    }
    
    return new Response(null, { status: 200 });
  }),
});

async function validatePolarWebhook(req: Request) {
  // Polar uses webhook signatures
  // Docs: https://docs.polar.sh/developers/webhooks/validation
  const signature = req.headers.get("polar-signature");
  const payload = await req.text();
  
  // Implement signature validation here
  // Use: process.env.POLAR_WEBHOOK_SECRET
  
  return JSON.parse(payload);
}
```

#### 2. Create Subscription Mutations
```typescript
// convex/subscriptions.ts
export const upsertSubscription = internalMutation({
  args: { data: v.any() }, // Define proper validator based on Polar payload
  returns: v.null(),
  handler: async (ctx, { data }) => {
    // Find user by Polar customer ID or email
    const user = await ctx.db
      .query("users")
      .withIndex("byPolarCustomerId", (q) => 
        q.eq("polarCustomerId", data.customer_id)
      )
      .unique();
    
    if (!user) {
      console.error("User not found for Polar customer:", data.customer_id);
      return null;
    }
    
    // Upsert subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("byPolarSubscriptionId", (q) => 
        q.eq("polarSubscriptionId", data.id)
      )
      .unique();
    
    const subscriptionData = {
      userId: user._id,
      polarSubscriptionId: data.id,
      polarProductId: data.product_id,
      status: data.status,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      cancelAtPeriodEnd: data.cancel_at_period_end,
      plan: {
        id: data.plan.id,
        name: data.plan.name,
        amount: data.plan.amount,
        currency: data.plan.currency,
        interval: data.plan.interval,
      },
    };
    
    if (existing) {
      await ctx.db.patch(existing._id, subscriptionData);
    } else {
      await ctx.db.insert("subscriptions", subscriptionData);
    }
    
    return null;
  },
});
```

### Phase 4: Update UI Components (1 day)

#### Replace `<Protect>` with custom logic
```tsx
// Before (Clerk Billing):
<Protect
  condition={(has) => !has({ plan: "free_user" })}
  fallback={<UpgradeCard />}
>
  <PremiumContent />
</Protect>

// After (Polar):
<PaidFeature fallback={<UpgradeCard />}>
  <PremiumContent />
</PaidFeature>
```

### Phase 5: Environment Variables

#### Add to `.env.local`:
```bash
NEXT_PUBLIC_POLAR_PUBLISHABLE_KEY=pk_...
POLAR_SECRET_KEY=sk_...
```

#### Add to Convex Dashboard:
```bash
POLAR_WEBHOOK_SECRET=whsec_...
```

### Phase 6: Testing Checklist (2-3 days)

- [ ] User can see pricing page
- [ ] User can click "Subscribe" and go to Polar checkout
- [ ] After payment, webhook fires and subscription is created
- [ ] Subscription is linked to correct user
- [ ] Protected content becomes accessible
- [ ] Subscription updates (upgrades/downgrades) work
- [ ] Subscription cancellations work
- [ ] Expired subscriptions block access
- [ ] Edge cases: failed payments, refunds, etc.

---

## 📦 Resources & Documentation

### Clerk Billing
- **Docs:** https://clerk.com/docs/billing/overview
- **Pricing Table Component:** https://clerk.com/docs/components/billing/pricing-table
- **Webhooks:** https://clerk.com/docs/webhooks/overview
- **Dashboard:** https://dashboard.clerk.com

### Polar.sh
- **Docs:** https://docs.polar.sh/
- **Webhooks:** https://docs.polar.sh/developers/webhooks
- **Checkout:** https://docs.polar.sh/checkout/overview
- **API Reference:** https://api.polar.sh/docs
- **Dashboard:** https://polar.sh/dashboard

### Other Billing Options (Not Analyzed)
- **Stripe Billing:** https://stripe.com/billing (industry standard, most features)
- **Paddle:** https://www.paddle.com/ (good for SaaS, handles taxes)
- **Lemon Squeezy:** https://www.lemonsqueezy.com/ (simple, merchant of record)
- **Chargebee:** https://www.chargebee.com/ (enterprise-focused)

---

## 💡 Recommendations

### For Quick Launch (1-2 days)
**Use Clerk Billing**
- Fastest path to monetization
- Least code to write
- Already integrated with your auth

### For Long-Term Flexibility (1-2 weeks)
**Use Polar.sh**
- More control over pricing/features
- Better developer experience
- More transparent pricing
- Growing ecosystem

### For Maximum Control (2-4 weeks)
**Use Stripe Billing directly**
- Most mature platform
- Most payment methods
- Most integrations
- Most documentation

---

## 🚨 Important Notes

1. **Current State:** Since billing components are commented out and no real users have subscriptions, you can switch billing providers at ANY time without data migration concerns.

2. **User Data:** All user authentication data lives in Clerk. Billing is completely separate - you're only tracking subscription status in your Convex database.

3. **Testing:** Always test billing in development mode before going live. Both Clerk and Polar offer test modes.

4. **Compliance:** When you do implement billing, ensure you handle:
   - PCI compliance (handled by provider)
   - GDPR (user data export/deletion)
   - Sales tax (some providers handle this)
   - Terms of service
   - Refund policy

5. **Monitoring:** Set up monitoring for:
   - Failed webhook deliveries
   - Failed payments
   - Subscription churn
   - Revenue metrics

---

## 📝 Decision Log

**When to decide:** When core product features are working and you have users asking to pay

**How to decide:**
- If speed is priority → Clerk Billing
- If developer experience matters → Polar.sh
- If you need enterprise features → Stripe

**Current recommendation:** Start with Clerk Billing since you're already using Clerk. You can always migrate later if needed.

---

## ✅ Next Steps (When Ready)

1. [ ] Decide on billing provider (Clerk vs Polar vs Other)
2. [ ] Design pricing tiers (Free, Pro, Enterprise, etc.)
3. [ ] Set up billing provider account
4. [ ] Implement based on provider choice (follow guides above)
5. [ ] Test extensively in dev environment
6. [ ] Set up monitoring/alerts
7. [ ] Update terms of service / privacy policy
8. [ ] Launch! 🚀

---

**Remember:** Focus on building a product people want to pay for first. Billing is just plumbing - the value is in your core features!

