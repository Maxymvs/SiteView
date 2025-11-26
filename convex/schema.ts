import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { paymentAttemptSchemaValidator } from "./paymentAttemptTypes";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    // this the Clerk ID, stored in the subject JWT field
    externalId: v.string(),
  }).index("byExternalId", ["externalId"]),

  paymentAttempts: defineTable(paymentAttemptSchemaValidator)
    .index("byPaymentId", ["payment_id"])
    .index("byUserId", ["userId"])
    .index("byPayerUserId", ["payer.user_id"]),

  clients: defineTable({
    name: v.string(),
    email: v.string(),
  }).index("byEmail", ["email"]),

  projects: defineTable({
    clientId: v.id("clients"),
    name: v.string(),
    address: v.string(),
  }).index("byClientId", ["clientId"]),

  visits: defineTable({
    projectId: v.id("projects"),
    date: v.number(),
    notes: v.optional(v.string()),
    exteriorType: v.union(v.literal("splat"), v.literal("video")),
    splatUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    youtube360Url: v.optional(v.string()),
  })
    .index("byProjectId", ["projectId"])
    .index("byDate", ["date"]),

  photos: defineTable({
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
  }).index("byVisitId", ["visitId"]),

  projectAssignments: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: v.union(v.literal("operator"), v.literal("client")),
  })
    .index("byProjectId", ["projectId"])
    .index("byUserId", ["userId"])
    .index("byUserAndProject", ["userId", "projectId"]),
});