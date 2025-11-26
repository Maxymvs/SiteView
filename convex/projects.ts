import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    clientId: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    if (args.clientId) {
      return await ctx.db
        .query("projects")
        .withIndex("byClientId", (q) => q.eq("clientId", args.clientId!))
        .collect();
    }
    return await ctx.db.query("projects").collect();
  },
});

export const listWithClient = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const projectsWithClient = await Promise.all(
      projects.map(async (project) => {
        const client = await ctx.db.get(project.clientId);
        return {
          ...project,
          client: client ? { name: client.name, email: client.email } : null,
        };
      })
    );
    return projectsWithClient;
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.string(),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      clientId: args.clientId,
      name: args.name,
      address: args.address,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
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
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
