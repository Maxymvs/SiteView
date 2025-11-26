import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    visitId: v.id("visits"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("photos")
      .withIndex("byVisitId", (q) => q.eq("visitId", args.visitId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("photos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    visitId: v.id("visits"),
    storageId: v.id("_storage"),
    fileUrl: v.string(),
    caption: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("plumbing"),
        v.literal("electrical"),
        v.literal("framing"),
        v.literal("general")
      )
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("photos", {
      visitId: args.visitId,
      storageId: args.storageId,
      fileUrl: args.fileUrl,
      caption: args.caption,
      category: args.category,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("photos"),
    caption: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("plumbing"),
        v.literal("electrical"),
        v.literal("framing"),
        v.literal("general")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(filteredUpdates).length === 0) {
      return id;
    }

    await ctx.db.patch(id, filteredUpdates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("photos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
