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
};

export const views = defineTable(documentSchema)
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
} = generateMutations("views", documentSchema, triggers);

export const recordView = mutation({
  args: {
    toUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const fromUserId = await getAuthUserId(ctx);
    if (!fromUserId) {
      throw new Error("Not authenticated");
    }

    if (fromUserId === args.toUserId) {
      // Don't record views to yourself
      return;
    }

    // Check if user exists
    const toUser = await ctx.db.get(args.toUserId);
    if (!toUser) {
      throw new Error("User not found");
    }

    // Check if a view already exists from this user to the target user
    const existingViews = await ctx.db
      .query("views")
      .withIndex("fromUserId", (q) => q.eq("fromUserId", fromUserId))
      .collect();

    const existingView = existingViews.find(
      (view) => view.toUserId === args.toUserId
    );

    // If a view exists, delete it so we can insert a new one with updated _creationTime
    if (existingView) {
      await ctx.db.delete(existingView._id);
    }

    // Insert a new view (will have a new _creationTime)
    return await ctx.db.insert("views", {
      fromUserId,
      toUserId: args.toUserId,
    });
  },
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Queries Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

export const getViewsForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const viewsList = await ctx.db
      .query("views")
      .withIndex("toUserId", (q) => q.eq("toUserId", userId))
      .order("desc")
      .collect();

    // Get user info for each view
    const viewsWithUsers = await Promise.all(
      viewsList.map(async (view) => {
        const fromUser = await ctx.db.get(view.fromUserId);
        if (!fromUser) {
          return {
            ...view,
            fromUser: null,
          };
        }

        const firstProfilePictureId = fromUser.profilePictures?.[0];
        const imageUrl = firstProfilePictureId
          ? await ctx.storage.getUrl(firstProfilePictureId)
          : null;

        return {
          ...view,
          fromUser: {
            _id: fromUser._id,
            name: fromUser.name,
            image: imageUrl,
          },
        };
      })
    );

    return viewsWithUsers;
  },
});
