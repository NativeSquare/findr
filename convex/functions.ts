import { getAuthUserId } from "@convex-dev/auth/server";
import { Triggers } from "convex-helpers/server/triggers";
import { v } from "convex/values";
import { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

const triggers = new Triggers<DataModel>();

// Cascade deletion
triggers.register("users", async (ctx, change) => {
  console.log("user changed", change);
  if (change.operation === "delete") {
    console.log("deleting user", change.id);
    // Delete all sessions for this user
    for await (const session of ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", change.id))) {
      await ctx.db.delete(session._id);
    }
    // Delete all accounts for this user
    for await (const account of ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), change.id))) {
      await ctx.db.delete(account._id);
    }
  }
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

export const markOnboardingCompleted = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, { hasCompletedOnboarding: true });
  },
});

export const updateUserAfterOnboarding = mutation({
  args: {
    userId: v.id("users"),
    data: v.object({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      bio: v.optional(v.string()),
      age: v.optional(v.number()),
      height: v.optional(
        v.object({
          value: v.number(),
          unit: v.string(),
        })
      ),
      weight: v.optional(
        v.object({
          value: v.number(),
          unit: v.string(),
        })
      ),
      position: v.optional(v.array(v.string())),
      ethnicity: v.optional(v.array(v.string())),
      bodyTypes: v.optional(v.array(v.string())),
      orientation: v.optional(v.string()),
      lookingFor: v.optional(v.array(v.string())),
      privacy: v.optional(
        v.object({
          hideDistance: v.optional(v.boolean()),
          hideAge: v.optional(v.boolean()),
          hideOnlineStatus: v.optional(v.boolean()),
          hideProfileFromDiscovery: v.optional(v.boolean()),
        })
      ),
      profilePictures: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, args.data);
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    data: v.object({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      bio: v.optional(v.string()),
      age: v.optional(v.number()),
      height: v.optional(
        v.object({
          value: v.number(),
          unit: v.string(),
        })
      ),
      weight: v.optional(
        v.object({
          value: v.number(),
          unit: v.string(),
        })
      ),
      position: v.optional(v.array(v.string())),
      ethnicity: v.optional(v.array(v.string())),
      bodyTypes: v.optional(v.array(v.string())),
      orientation: v.optional(v.string()),
      lookingFor: v.optional(v.array(v.string())),
      privacy: v.optional(
        v.object({
          hideDistance: v.optional(v.boolean()),
          hideAge: v.optional(v.boolean()),
          hideOnlineStatus: v.optional(v.boolean()),
          hideProfileFromDiscovery: v.optional(v.boolean()),
        })
      ),
      profilePictures: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, args.data);
  },
});

export const updateUserPermissions = mutation({
  args: {
    userId: v.id("users"),
    data: v.object({
      privacy: v.optional(
        v.object({
          hideDistance: v.optional(v.boolean()),
          hideAge: v.optional(v.boolean()),
          hideOnlineStatus: v.optional(v.boolean()),
          hideProfileFromDiscovery: v.optional(v.boolean()),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, args.data);
  },
});

export const deleteUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    await ctx.db.delete("users", userId);
  },
});
