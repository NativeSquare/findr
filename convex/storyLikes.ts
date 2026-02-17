import { getAuthUserId } from "@convex-dev/auth/server";
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Schema Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

const documentSchema = {
  fromUserId: v.id("users"),
  toUserId: v.id("users"),
  storyId: v.id("stories"),
};

export const storyLikes = defineTable(documentSchema)
  .index("by_storyId", ["storyId"])
  .index("by_toUserId", ["toUserId"])
  .index("by_fromUserId_storyId", ["fromUserId", "storyId"]);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Mutations Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

/**
 * Toggle a like on a story. If already liked, removes it; otherwise creates it.
 */
export const toggleStoryLike = mutation({
  args: {
    storyId: v.id("stories"),
  },
  handler: async (ctx, args) => {
    const fromUserId = await getAuthUserId(ctx);
    if (!fromUserId) {
      throw new Error("Not authenticated");
    }

    const story = await ctx.db.get(args.storyId);
    if (!story) {
      throw new Error("Story not found");
    }

    if (story.authorId === fromUserId) {
      throw new Error("Cannot like your own story");
    }

    // Check if already liked
    const existingLike = await ctx.db
      .query("storyLikes")
      .withIndex("by_fromUserId_storyId", (q) =>
        q.eq("fromUserId", fromUserId).eq("storyId", args.storyId)
      )
      .first();

    if (existingLike) {
      await ctx.db.delete(existingLike._id);
      return { liked: false };
    }

    await ctx.db.insert("storyLikes", {
      fromUserId,
      toUserId: story.authorId,
      storyId: args.storyId,
    });

    return { liked: true };
  },
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Queries Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

/**
 * Check if the current user has liked a specific story.
 */
export const isStoryLiked = query({
  args: {
    storyId: v.id("stories"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const existingLike = await ctx.db
      .query("storyLikes")
      .withIndex("by_fromUserId_storyId", (q) =>
        q.eq("fromUserId", userId).eq("storyId", args.storyId)
      )
      .first();

    return !!existingLike;
  },
});

/**
 * Get all story likes received by the current user (for the Taps screen).
 */
export const getStoryLikesForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const likesList = await ctx.db
      .query("storyLikes")
      .withIndex("by_toUserId", (q) => q.eq("toUserId", userId))
      .order("desc")
      .collect();

    const likesWithUsers = await Promise.all(
      likesList.map(async (like) => {
        const fromUser = await ctx.db.get(like.fromUserId);
        const story = await ctx.db.get(like.storyId);

        const storyImageUrl = story
          ? await ctx.storage.getUrl(story.imageStorageId)
          : null;

        if (!fromUser) {
          return {
            ...like,
            fromUser: null,
            storyImageUrl,
          };
        }

        const firstProfilePictureId = fromUser.profilePictures?.[0];
        const imageUrl = firstProfilePictureId
          ? await ctx.storage.getUrl(firstProfilePictureId)
          : null;

        return {
          ...like,
          fromUser: {
            _id: fromUser._id,
            name: fromUser.name,
            image: imageUrl,
          },
          storyImageUrl,
        };
      })
    );

    return likesWithUsers;
  },
});
