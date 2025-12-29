import { getAuthUserId } from "@convex-dev/auth/server";
import { Triggers } from "convex-helpers/server/triggers";
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { generateMutations } from "./lib/mutations";

const triggers = new Triggers<DataModel>();

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Schema Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

const documentSchema = {
  fromUserId: v.id("users"),
  toUserId: v.id("users"),
  emoji: v.string(), // emoji character
};

export const taps = defineTable(documentSchema)
  .index("toUserId", ["toUserId"])
  .index("fromUserId", ["fromUserId"]);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Mutations Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

export const {
  delete: del,
  insert,
  patch,
  replace,
} = generateMutations("taps", documentSchema, triggers);

export const sendTap = mutation({
  args: {
    toUserId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const fromUserId = await getAuthUserId(ctx);
    if (!fromUserId) {
      throw new Error("Not authenticated");
    }

    if (fromUserId === args.toUserId) {
      throw new Error("Cannot send tap to yourself");
    }

    // Check if user exists
    const toUser = await ctx.db.get(args.toUserId);
    if (!toUser) {
      throw new Error("User not found");
    }

    // Check if a tap already exists from this user to the target user
    const existingTaps = await ctx.db
      .query("taps")
      .withIndex("fromUserId", (q) => q.eq("fromUserId", fromUserId))
      .collect();

    const existingTap = existingTaps.find(
      (tap) => tap.toUserId === args.toUserId
    );

    // If a tap exists, delete it so we can insert a new one with updated emoji and _creationTime
    if (existingTap) {
      await ctx.db.delete(existingTap._id);
    }

    // Insert a new tap (will have a new _creationTime)
    return await ctx.db.insert("taps", {
      fromUserId,
      toUserId: args.toUserId,
      emoji: args.emoji,
    });
  },
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Queries Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

export const getTapsForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const tapsList = await ctx.db
      .query("taps")
      .withIndex("toUserId", (q) => q.eq("toUserId", userId))
      .order("desc")
      .collect();

    // Get user info for each tap
    const tapsWithUsers = await Promise.all(
      tapsList.map(async (tap) => {
        const fromUser = await ctx.db.get(tap.fromUserId);
        return {
          ...tap,
          fromUser: fromUser
            ? {
                _id: fromUser._id,
                name: fromUser.name,
                image: fromUser.profilePictures?.[0],
              }
            : null,
        };
      })
    );

    return tapsWithUsers;
  },
});

export const getTap = query({
  args: {
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const tap = await ctx.db
      .query("taps")
      .filter((q) =>
        q.and(
          q.eq(q.field("toUserId"), args.toUserId),
          q.eq(q.field("fromUserId"), args.fromUserId)
        )
      )
      .first();
    return tap;
  },
});
