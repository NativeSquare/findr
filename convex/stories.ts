import { getAuthUserId } from "@convex-dev/auth/server";
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Schema Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

const documentSchema = {
  authorId: v.id("users"),
  imageStorageId: v.id("_storage"),
  expiresAt: v.number(), // Unix timestamp (ms) — creation time + 24 hours
};

export const stories = defineTable(documentSchema)
  .index("by_authorId", ["authorId"])
  .index("by_expiresAt", ["expiresAt"]);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Mutations Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Create a new story for the current user.
 */
export const createStory = mutation({
  args: {
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    const storyId = await ctx.db.insert("stories", {
      authorId: currentUserId,
      imageStorageId: args.imageStorageId,
      expiresAt: now + TWENTY_FOUR_HOURS_MS,
    });

    return storyId;
  },
});

/**
 * Delete a story (author only).
 */
export const deleteStory = mutation({
  args: {
    storyId: v.id("stories"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const story = await ctx.db.get(args.storyId);
    if (!story) {
      throw new Error("Story not found");
    }

    if (story.authorId !== currentUserId) {
      throw new Error("Only the author can delete this story");
    }

    // Delete the stored image
    await ctx.storage.delete(story.imageStorageId);

    await ctx.db.delete(args.storyId);
  },
});

/**
 * Internal mutation to clean up expired stories (called by cron).
 */
export const cleanupExpiredStories = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const expiredStories = await ctx.db
      .query("stories")
      .withIndex("by_expiresAt")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    for (const story of expiredStories) {
      // Delete the stored image
      await ctx.storage.delete(story.imageStorageId);
      await ctx.db.delete(story._id);
    }

    return { deleted: expiredStories.length };
  },
});
