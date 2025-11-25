import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserProjects = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("projectAssignments")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .collect();

    const projects = await Promise.all(
      assignments.map(async (assignment) => {
        const project = await ctx.db.get(assignment.projectId);
        return project ? { ...project, role: assignment.role } : null;
      })
    );

    return projects.filter((p) => p !== null);
  },
});

export const getProjectUsers = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("projectAssignments")
      .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const users = await Promise.all(
      assignments.map(async (assignment) => {
        const user = await ctx.db.get(assignment.userId);
        return user ? { ...user, role: assignment.role } : null;
      })
    );

    return users.filter((u) => u !== null);
  },
});

export const assign = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: v.union(v.literal("operator"), v.literal("client")),
  },
  handler: async (ctx, args) => {
    // Check if assignment already exists
    const existing = await ctx.db
      .query("projectAssignments")
      .withIndex("byUserAndProject", (q) =>
        q.eq("userId", args.userId).eq("projectId", args.projectId)
      )
      .unique();

    if (existing) {
      // Update role if already assigned
      await ctx.db.patch(existing._id, { role: args.role });
      return existing._id;
    }

    return await ctx.db.insert("projectAssignments", {
      projectId: args.projectId,
      userId: args.userId,
      role: args.role,
    });
  },
});

export const remove = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const assignment = await ctx.db
      .query("projectAssignments")
      .withIndex("byUserAndProject", (q) =>
        q.eq("userId", args.userId).eq("projectId", args.projectId)
      )
      .unique();

    if (assignment) {
      await ctx.db.delete(assignment._id);
    }
  },
});
