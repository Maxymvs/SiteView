import { mutation } from "./_generated/server";

export const seedTestData = mutation({
  handler: async (ctx) => {
    // Create test client
    const clientId = await ctx.db.insert("clients", {
      name: "Acme Construction",
      email: "contact@acme-construction.com",
    });

    const clientId2 = await ctx.db.insert("clients", {
      name: "HomeBuilder Inc",
      email: "info@homebuilder.com",
    });

    // Create test projects
    const project1 = await ctx.db.insert("projects", {
      clientId,
      name: "Downtown Office Renovation",
      address: "123 Main St, San Francisco, CA 94102",
    });

    const project2 = await ctx.db.insert("projects", {
      clientId,
      name: "Residential New Build",
      address: "456 Oak Avenue, Palo Alto, CA 94301",
    });

    const project3 = await ctx.db.insert("projects", {
      clientId: clientId2,
      name: "Kitchen Remodel",
      address: "789 Pine Lane, San Jose, CA 95101",
    });

    // Create test visits with different media types
    const visit1 = await ctx.db.insert("visits", {
      projectId: project1,
      date: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
      exteriorType: "video",
      youtube360Url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      notes: "Initial site survey - captured full exterior",
    });

    const visit2 = await ctx.db.insert("visits", {
      projectId: project1,
      date: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      exteriorType: "splat",
      splatUrl: "https://lumalabs.ai/embed/example-splat-id",
      notes: "Framing complete - 3D gaussian splat capture",
    });

    const visit3 = await ctx.db.insert("visits", {
      projectId: project2,
      date: Date.now(),
      exteriorType: "video",
      videoUrl: "https://example.com/videos/site-walkthrough.mp4",
      notes: "Foundation inspection",
    });

    // Get a test user (if exists) for project assignments
    const existingUser = await ctx.db.query("users").first();

    if (existingUser) {
      await ctx.db.insert("projectAssignments", {
        projectId: project1,
        userId: existingUser._id,
        role: "operator",
      });

      await ctx.db.insert("projectAssignments", {
        projectId: project2,
        userId: existingUser._id,
        role: "operator",
      });
    }

    return {
      created: {
        clients: 2,
        projects: 3,
        visits: 3,
        projectAssignments: existingUser ? 2 : 0,
      },
      ids: {
        clients: [clientId, clientId2],
        projects: [project1, project2, project3],
        visits: [visit1, visit2, visit3],
      },
    };
  },
});

export const clearTestData = mutation({
  handler: async (ctx) => {
    // Delete in reverse order of dependencies
    const photos = await ctx.db.query("photos").collect();
    for (const photo of photos) {
      await ctx.db.delete(photo._id);
    }

    const visits = await ctx.db.query("visits").collect();
    for (const visit of visits) {
      await ctx.db.delete(visit._id);
    }

    const assignments = await ctx.db.query("projectAssignments").collect();
    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    const projects = await ctx.db.query("projects").collect();
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }

    const clients = await ctx.db.query("clients").collect();
    for (const client of clients) {
      await ctx.db.delete(client._id);
    }

    return {
      deleted: {
        photos: photos.length,
        visits: visits.length,
        projectAssignments: assignments.length,
        projects: projects.length,
        clients: clients.length,
      },
    };
  },
});
