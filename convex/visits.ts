import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("visits")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const listByDate = query({
  args: {
    order: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("visits")
      .withIndex("byDate")
      .order(args.order ?? "desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("visits") },
  handler: async (ctx, args) => {
    const visit = await ctx.db.get(args.id);
    if (!visit) return null;

    const photos = await ctx.db
      .query("photos")
      .withIndex("byVisitId", (q) => q.eq("visitId", args.id))
      .collect();

    return { ...visit, photos };
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    date: v.number(),
    notes: v.optional(v.string()),
    exteriorType: v.union(v.literal("splat"), v.literal("video")),
    splatUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    youtube360Url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("visits", {
      projectId: args.projectId,
      date: args.date,
      notes: args.notes,
      exteriorType: args.exteriorType,
      splatUrl: args.splatUrl,
      videoUrl: args.videoUrl,
      youtube360Url: args.youtube360Url,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("visits"),
    date: v.optional(v.number()),
    notes: v.optional(v.string()),
    exteriorType: v.optional(v.union(v.literal("splat"), v.literal("video"))),
    splatUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    youtube360Url: v.optional(v.string()),
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
  args: { id: v.id("visits") },
  handler: async (ctx, args) => {
    // Delete associated photos first
    const photos = await ctx.db
      .query("photos")
      .withIndex("byVisitId", (q) => q.eq("visitId", args.id))
      .collect();

    for (const photo of photos) {
      await ctx.db.delete(photo._id);
    }

    await ctx.db.delete(args.id);
  },
});
