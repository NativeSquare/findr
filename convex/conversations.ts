import { getAuthUserId } from "@convex-dev/auth/server";
import { Triggers } from "convex-helpers/server/triggers";
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { generateMutations } from "./lib/mutations";

const triggers = new Triggers<DataModel>();

// Cascade deletion: when a conversation is deleted, delete all its messages
triggers.register("conversations", async (ctx, change) => {
  if (change.operation === "delete") {
    for await (const message of ctx.db
      .query("messages")
      .withIndex("conversationId", (q) => q.eq("conversationId", change.id))) {
      await ctx.db.delete(message._id);
    }
  }
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Schema Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

const documentSchema = {
  participant1Id: v.id("users"),
  participant2Id: v.id("users"),
  lastMessageId: v.optional(v.id("messages")),
  lastMessageTime: v.optional(v.number()),
};

export const conversations = defineTable(documentSchema)
  .index("participant1Id", ["participant1Id"])
  .index("participant2Id", ["participant2Id"])
  .index("participants", ["participant1Id", "participant2Id"]);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Mutations Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

export const {
  delete: del,
  insert,
  patch,
  replace,
} = generateMutations("conversations", documentSchema, triggers);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Queries Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

/**
 * Get or create a conversation between the current user and another user.
 * Returns the conversation ID.
 */
export const getOrCreateConversation = mutation({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    if (currentUserId === args.otherUserId) {
      throw new Error("Cannot create conversation with yourself");
    }

    // Check if other user exists
    const otherUser = await ctx.db.get(args.otherUserId);
    if (!otherUser) {
      throw new Error("User not found");
    }

    // Normalize participant IDs (always store smaller ID first for consistency)
    const [participant1Id, participant2Id] =
      currentUserId < args.otherUserId
        ? [currentUserId, args.otherUserId]
        : [args.otherUserId, currentUserId];

    // Check if conversation already exists
    const existingConversation = await ctx.db
      .query("conversations")
      .withIndex("participants", (q) =>
        q
          .eq("participant1Id", participant1Id)
          .eq("participant2Id", participant2Id)
      )
      .first();

    if (existingConversation) {
      return existingConversation._id;
    }

    // Create new conversation
    return await ctx.db.insert("conversations", {
      participant1Id,
      participant2Id,
    });
  },
});

/**
 * Get a conversation between the current user and another user.
 */
export const getConversation = query({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return null;

    // Normalize participant IDs
    const [participant1Id, participant2Id] =
      currentUserId < args.otherUserId
        ? [currentUserId, args.otherUserId]
        : [args.otherUserId, currentUserId];

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("participants", (q) =>
        q
          .eq("participant1Id", participant1Id)
          .eq("participant2Id", participant2Id)
      )
      .first();

    if (!conversation) return null;

    // Get the other participant's user info
    const otherUser = await ctx.db.get(args.otherUserId);
    if (!otherUser) return null;

    return {
      ...conversation,
      otherUser: {
        _id: otherUser._id,
        name: otherUser.name,
        image: otherUser.profilePictures?.[0],
      },
    };
  },
});

/**
 * Get all conversations for the current user, ordered by last message time.
 * Includes the last message and other participant info.
 */
export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return [];

    // Get all conversations where current user is participant1
    const conversationsAsParticipant1 = await ctx.db
      .query("conversations")
      .withIndex("participant1Id", (q) => q.eq("participant1Id", currentUserId))
      .collect();

    // Get all conversations where current user is participant2
    const conversationsAsParticipant2 = await ctx.db
      .query("conversations")
      .withIndex("participant2Id", (q) => q.eq("participant2Id", currentUserId))
      .collect();

    // Combine and process conversations
    const allConversations = [
      ...conversationsAsParticipant1,
      ...conversationsAsParticipant2,
    ];

    // Get last message and other participant info for each conversation
    const conversationsWithDetails = await Promise.all(
      allConversations.map(async (conversation) => {
        // Determine the other participant
        const otherUserId =
          conversation.participant1Id === currentUserId
            ? conversation.participant2Id
            : conversation.participant1Id;

        const otherUser = await ctx.db.get(otherUserId);
        if (!otherUser) return null;

        // Get last message if available
        let lastMessage = null;
        if (conversation.lastMessageId) {
          const message = await ctx.db.get(conversation.lastMessageId);
          if (message) {
            lastMessage = {
              text: message.text,
              timestamp: message._creationTime,
              isOutgoing: message.senderId === currentUserId,
            };
          }
        }

        // Fallback: if lastMessageId is invalid or missing, query for the actual last message
        if (!lastMessage) {
          const allMessages = await ctx.db
            .query("messages")
            .withIndex("conversationId", (q) =>
              q.eq("conversationId", conversation._id)
            )
            .order("desc")
            .first();

          if (allMessages) {
            lastMessage = {
              text: allMessages.text,
              timestamp: allMessages._creationTime,
              isOutgoing: allMessages.senderId === currentUserId,
            };
          }
        }

        // Count unread messages from the other participant
        const messagesList = await ctx.db
          .query("messages")
          .withIndex("conversationId", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .collect();

        const unreadCount = messagesList.filter(
          (message) =>
            message.senderId !== currentUserId &&
            (message.read === false || !message.read)
        ).length;

        return {
          _id: conversation._id,
          otherUser: {
            _id: otherUser._id,
            name: otherUser.name,
            image: otherUser.profilePictures?.[0],
          },
          lastMessage: lastMessage?.text || null,
          lastMessageTime:
            lastMessage?.timestamp ||
            conversation.lastMessageTime ||
            conversation._creationTime,
          unreadCount,
        };
      })
    );

    // Filter out nulls (in case a participant was deleted)
    const validConversations = conversationsWithDetails.filter(
      (conv): conv is NonNullable<typeof conv> => conv !== null
    );

    // Sort by last message time (most recent first)
    return validConversations.sort(
      (a, b) => b.lastMessageTime - a.lastMessageTime
    );
  },
});
