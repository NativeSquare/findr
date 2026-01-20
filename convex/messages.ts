import { getAuthUserId } from "@convex-dev/auth/server";
import { Triggers } from "convex-helpers/server/triggers";
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { generateMutations } from "./lib/mutations";

const triggers = new Triggers<DataModel>();

// When a message is inserted, update the conversation's lastMessageId and lastMessageTime
triggers.register("messages", async (ctx, change) => {
  if (change.operation === "insert") {
    const message = change.newDoc;
    await ctx.db.patch(message.conversationId, {
      lastMessageId: message._id,
      lastMessageTime: message._creationTime,
    });
  }

  // When a message is deleted, update the conversation's lastMessageId if needed
  if (change.operation === "delete") {
    const deletedMessage = change.oldDoc;
    const conversation = await ctx.db.get(deletedMessage.conversationId);
    if (!conversation) return;

    // If the deleted message was the last message, find the new last message
    if (conversation.lastMessageId === deletedMessage._id) {
      const remainingMessages = await ctx.db
        .query("messages")
        .withIndex("conversationId", (q) =>
          q.eq("conversationId", deletedMessage.conversationId)
        )
        .order("desc")
        .first();

      if (remainingMessages) {
        await ctx.db.patch(deletedMessage.conversationId, {
          lastMessageId: remainingMessages._id,
          lastMessageTime: remainingMessages._creationTime,
        });
      } else {
        // No messages left, clear the last message info
        await ctx.db.patch(deletedMessage.conversationId, {
          lastMessageId: undefined,
          lastMessageTime: undefined,
        });
      }
    }
  }
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Schema Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

const documentSchema = {
  conversationId: v.id("conversations"),
  senderId: v.id("users"),
  text: v.string(),
  imageUrls: v.optional(v.array(v.string())),
  read: v.optional(v.boolean()),
  // View-once photo fields
  viewOnce: v.optional(v.boolean()),
  viewOnceOpened: v.optional(v.boolean()),
  // Time-limited album sharing fields
  albumId: v.optional(v.id("albums")),
  albumExpiresAt: v.optional(v.number()), // Unix timestamp when album access expires
  albumTitle: v.optional(v.string()), // Denormalized for display
  albumCoverUrl: v.optional(v.string()), // Denormalized cover photo URL
  albumPhotoCount: v.optional(v.number()), // Number of photos in the album
};

export const messages = defineTable(documentSchema)
  .index("conversationId", ["conversationId"])
  .index("senderId", ["senderId"]);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Mutations Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

export const {
  delete: del,
  insert,
  patch,
  replace,
} = generateMutations("messages", documentSchema, triggers);

// Maximum message length (5000 characters)
const MAX_MESSAGE_LENGTH = 5000;

/**
 * Send a message to another user. Creates a conversation if it doesn't exist.
 */
export const sendMessage = mutation({
  args: {
    otherUserId: v.id("users"),
    text: v.string(),
    imageUrls: v.optional(v.array(v.string())),
    viewOnce: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    if (currentUserId === args.otherUserId) {
      throw new Error("Cannot send message to yourself");
    }

    // Validate: either text or imageUrls must be provided
    const trimmedText = args.text.trim();
    const hasImages = args.imageUrls && args.imageUrls.length > 0;
    if (!trimmedText && !hasImages) {
      throw new Error("Message must have either text or images");
    }
    if (trimmedText && trimmedText.length > MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Message text cannot exceed ${MAX_MESSAGE_LENGTH} characters`
      );
    }

    // Check if other user exists
    const otherUser = await ctx.db.get(args.otherUserId);
    if (!otherUser) {
      throw new Error("User not found");
    }

    // Get or create conversation
    const [participant1Id, participant2Id] =
      currentUserId < args.otherUserId
        ? [currentUserId, args.otherUserId]
        : [args.otherUserId, currentUserId];

    let conversation = await ctx.db
      .query("conversations")
      .withIndex("participants", (q) =>
        q
          .eq("participant1Id", participant1Id)
          .eq("participant2Id", participant2Id)
      )
      .first();

    if (!conversation) {
      // Create new conversation
      const conversationId = await ctx.db.insert("conversations", {
        participant1Id,
        participant2Id,
      });
      conversation = await ctx.db.get(conversationId);
      if (!conversation) {
        throw new Error("Failed to create conversation");
      }
    }

    // Insert message
    const messageId = await ctx.db.insert("messages", {
      conversationId: conversation._id,
      senderId: currentUserId,
      text: trimmedText || "",
      imageUrls: hasImages ? args.imageUrls : undefined,
      read: false,
      viewOnce: args.viewOnce ?? false,
      viewOnceOpened: false,
    });

    // The trigger will update the conversation's lastMessageId and lastMessageTime
    return messageId;
  },
});

/**
 * Send a message to a conversation by conversation ID.
 * Useful when you already have the conversation ID.
 */
export const sendMessageByConversationId = mutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.string(),
    imageUrls: v.optional(v.array(v.string())),
    viewOnce: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Validate: either text or imageUrls must be provided
    const trimmedText = args.text.trim();
    const hasImages = args.imageUrls && args.imageUrls.length > 0;
    if (!trimmedText && !hasImages) {
      throw new Error("Message must have either text or images");
    }
    if (trimmedText && trimmedText.length > MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Message text cannot exceed ${MAX_MESSAGE_LENGTH} characters`
      );
    }

    // Verify the user is a participant in this conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (
      conversation.participant1Id !== currentUserId &&
      conversation.participant2Id !== currentUserId
    ) {
      throw new Error("Not authorized to send messages in this conversation");
    }

    // Insert message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: currentUserId,
      text: trimmedText || "",
      imageUrls: hasImages ? args.imageUrls : undefined,
      read: false,
      viewOnce: args.viewOnce ?? false,
      viewOnceOpened: false,
    });

    // The trigger will update the conversation's lastMessageId and lastMessageTime
    return messageId;
  },
});

/**
 * Send an album as a time-limited message.
 * The album will be accessible for the specified duration.
 */
export const sendAlbumMessage = mutation({
  args: {
    otherUserId: v.id("users"),
    albumId: v.id("albums"),
    durationMs: v.number(), // Duration in milliseconds
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    if (currentUserId === args.otherUserId) {
      throw new Error("Cannot send message to yourself");
    }

    // Check if other user exists
    const otherUser = await ctx.db.get(args.otherUserId);
    if (!otherUser) {
      throw new Error("User not found");
    }

    // Get the album and verify ownership
    const album = await ctx.db.get(args.albumId);
    if (!album) {
      throw new Error("Album not found");
    }
    if (album.userId !== currentUserId) {
      throw new Error("Not authorized to share this album");
    }

    // Get album photos
    const photos = await ctx.db
      .query("albumPhotos")
      .withIndex("albumId", (q) => q.eq("albumId", args.albumId))
      .collect();

    if (photos.length === 0) {
      throw new Error("Album has no photos to share");
    }

    // Get cover photo URL
    let coverPhotoUrl: string | undefined;
    if (album.coverPhotoId) {
      const coverPhoto = await ctx.db.get(album.coverPhotoId);
      if (coverPhoto) {
        coverPhotoUrl = coverPhoto.photoUrl;
      }
    }
    if (!coverPhotoUrl && photos.length > 0) {
      coverPhotoUrl = photos[0].photoUrl;
    }

    // Get or create conversation
    const [participant1Id, participant2Id] =
      currentUserId < args.otherUserId
        ? [currentUserId, args.otherUserId]
        : [args.otherUserId, currentUserId];

    let conversation = await ctx.db
      .query("conversations")
      .withIndex("participants", (q) =>
        q
          .eq("participant1Id", participant1Id)
          .eq("participant2Id", participant2Id)
      )
      .first();

    if (!conversation) {
      const conversationId = await ctx.db.insert("conversations", {
        participant1Id,
        participant2Id,
      });
      conversation = await ctx.db.get(conversationId);
      if (!conversation) {
        throw new Error("Failed to create conversation");
      }
    }

    // Calculate expiration time
    const now = Date.now();
    const expiresAt = now + args.durationMs;

    // Insert message with album data
    const messageId = await ctx.db.insert("messages", {
      conversationId: conversation._id,
      senderId: currentUserId,
      text: "",
      read: false,
      // Album fields
      albumId: args.albumId,
      albumExpiresAt: expiresAt,
      albumTitle: album.title,
      albumCoverUrl: coverPhotoUrl,
      albumPhotoCount: photos.length,
    });

    return messageId;
  },
});

/**
 * Edit a message. Only the sender can edit their own messages.
 */
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Get the message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Verify the user is the sender
    if (message.senderId !== currentUserId) {
      throw new Error("Not authorized to edit this message");
    }

    // Validate text
    const trimmedText = args.text.trim();
    if (!trimmedText) {
      throw new Error("Message text cannot be empty");
    }
    if (trimmedText.length > MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Message text cannot exceed ${MAX_MESSAGE_LENGTH} characters`
      );
    }

    // Update the message
    await ctx.db.patch(args.messageId, {
      text: trimmedText,
    });

    return args.messageId;
  },
});

/**
 * Delete a message. Only the sender can delete their own messages.
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Get the message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Verify the user is the sender
    if (message.senderId !== currentUserId) {
      throw new Error("Not authorized to delete this message");
    }

    // Delete the message
    await ctx.db.delete(args.messageId);

    return null;
  },
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Queries Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

/**
 * Get all messages for a conversation, ordered by creation time (oldest first).
 * Supports pagination with optional limit and cursor.
 */
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return { messages: [], isDone: true, nextCursor: null };

    // Verify the user is a participant in this conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return { messages: [], isDone: true, nextCursor: null };
    }

    if (
      conversation.participant1Id !== currentUserId &&
      conversation.participant2Id !== currentUserId
    ) {
      throw new Error("Not authorized to view this conversation");
    }

    const limit = args.limit ?? 50;

    // Get all messages for this conversation
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    // If cursor is provided, filter messages after the cursor
    let messagesToReturn = allMessages;
    if (args.cursor) {
      const cursorIndex = allMessages.findIndex((m) => m._id === args.cursor);
      if (cursorIndex >= 0) {
        messagesToReturn = allMessages.slice(cursorIndex + 1);
      }
    }

    // Apply limit
    const hasMore = messagesToReturn.length > limit;
    const messages = hasMore
      ? messagesToReturn.slice(0, limit)
      : messagesToReturn;

    // Format messages for the frontend
    const formattedMessages = messages.map((message) => ({
      _id: message._id,
      text: message.text,
      // For view-once messages that haven't been opened, hide the imageUrls
      // For view-once messages that have been opened, show nothing
      // For outgoing view-once messages, show nothing (sender can't see their own view-once photos)
      imageUrls:
        message.viewOnce
          ? message.viewOnceOpened || message.senderId === currentUserId
            ? undefined
            : message.imageUrls
          : message.imageUrls,
      timestamp: message._creationTime,
      isOutgoing: message.senderId === currentUserId,
      read: message.read ?? false,
      viewOnce: message.viewOnce ?? false,
      viewOnceOpened: message.viewOnceOpened ?? false,
    }));

    return {
      messages: formattedMessages,
      isDone: !hasMore,
      nextCursor:
        hasMore && messages.length > 0
          ? messages[messages.length - 1]._id
          : null,
    };
  },
});

/**
 * Get a single message by ID.
 */
export const getMessage = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return null;

    const message = await ctx.db.get(args.messageId);
    if (!message) return null;

    // Verify the user is a participant in the conversation
    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) return null;

    if (
      conversation.participant1Id !== currentUserId &&
      conversation.participant2Id !== currentUserId
    ) {
      throw new Error("Not authorized to view this message");
    }

    return {
      _id: message._id,
      text: message.text,
      imageUrls:
        message.viewOnce
          ? message.viewOnceOpened || message.senderId === currentUserId
            ? undefined
            : message.imageUrls
          : message.imageUrls,
      timestamp: message._creationTime,
      isOutgoing: message.senderId === currentUserId,
      read: message.read ?? false,
      viewOnce: message.viewOnce ?? false,
      viewOnceOpened: message.viewOnceOpened ?? false,
    };
  },
});

/**
 * Get messages for a conversation by other user ID (convenience method).
 */
export const getMessagesByUserId = query({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return [];

    // Normalize participant IDs
    const [participant1Id, participant2Id] =
      currentUserId < args.otherUserId
        ? [currentUserId, args.otherUserId]
        : [args.otherUserId, currentUserId];

    // Find the conversation
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("participants", (q) =>
        q
          .eq("participant1Id", participant1Id)
          .eq("participant2Id", participant2Id)
      )
      .first();

    if (!conversation) return [];

    // Get messages using the conversation ID
    const messagesList = await ctx.db
      .query("messages")
      .withIndex("conversationId", (q) =>
        q.eq("conversationId", conversation._id)
      )
      .order("asc")
      .collect();

    // Format messages for the frontend
    return messagesList.map((message) => ({
      _id: message._id,
      text: message.text,
      imageUrls:
        message.viewOnce
          ? message.viewOnceOpened || message.senderId === currentUserId
            ? undefined
            : message.imageUrls
          : message.imageUrls,
      timestamp: message._creationTime,
      isOutgoing: message.senderId === currentUserId,
      read: message.read ?? false,
      viewOnce: message.viewOnce ?? false,
      viewOnceOpened: message.viewOnceOpened ?? false,
      // Album fields
      albumId: message.albumId,
      albumExpiresAt: message.albumExpiresAt,
      albumTitle: message.albumTitle,
      albumCoverUrl: message.albumCoverUrl,
      albumPhotoCount: message.albumPhotoCount,
    }));
  },
});

/**
 * Mark messages in a conversation as read.
 */
export const markMessagesAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Verify the user is a participant in this conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (
      conversation.participant1Id !== currentUserId &&
      conversation.participant2Id !== currentUserId
    ) {
      throw new Error("Not authorized to mark messages in this conversation");
    }

    // Mark all unread messages from the other participant as read
    const messagesList = await ctx.db
      .query("messages")
      .withIndex("conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const updates = messagesList
      .filter(
        (message) =>
          message.senderId !== currentUserId &&
          (message.read === false || !message.read)
      )
      .map((message) =>
        ctx.db.patch(message._id, {
          read: true,
        })
      );

    await Promise.all(updates);
    return updates.length;
  },
});

/**
 * Mark a single message as read.
 */
export const markMessageAsRead = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Verify the user is a participant in the conversation
    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (
      conversation.participant1Id !== currentUserId &&
      conversation.participant2Id !== currentUserId
    ) {
      throw new Error("Not authorized to mark this message");
    }

    // Only mark as read if the message is from the other participant
    if (message.senderId === currentUserId) {
      return null;
    }

    await ctx.db.patch(args.messageId, {
      read: true,
    });

    return args.messageId;
  },
});

/**
 * Open a view-once photo. This marks the photo as viewed and clears the image URL.
 * Only the recipient can open a view-once photo.
 */
export const openViewOncePhoto = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only view-once messages can be opened this way
    if (!message.viewOnce) {
      throw new Error("This is not a view-once message");
    }

    // Already opened
    if (message.viewOnceOpened) {
      throw new Error("This photo has already been viewed");
    }

    // Only the recipient can view the photo (not the sender)
    if (message.senderId === currentUserId) {
      throw new Error("You cannot view your own view-once photo");
    }

    // Verify the user is a participant in the conversation
    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (
      conversation.participant1Id !== currentUserId &&
      conversation.participant2Id !== currentUserId
    ) {
      throw new Error("Not authorized to view this message");
    }

    // Get the image URL before marking as opened (to return it for viewing)
    const imageUrl = message.imageUrls?.[0];

    // Mark the message as opened and clear the image URL
    await ctx.db.patch(args.messageId, {
      viewOnceOpened: true,
      imageUrls: undefined, // Clear the image URL so it can't be viewed again
      read: true,
    });

    return { imageUrl };
  },
});

/**
 * Get the image URL for a view-once photo (only if not yet opened).
 * This is used to display the photo in the viewer.
 */
export const getViewOncePhotoUrl = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return null;

    const message = await ctx.db.get(args.messageId);
    if (!message) return null;

    // Only view-once messages
    if (!message.viewOnce) return null;

    // Already opened
    if (message.viewOnceOpened) return null;

    // Only the recipient can view the photo (not the sender)
    if (message.senderId === currentUserId) return null;

    // Verify the user is a participant in the conversation
    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) return null;

    if (
      conversation.participant1Id !== currentUserId &&
      conversation.participant2Id !== currentUserId
    ) {
      return null;
    }

    return { imageUrl: message.imageUrls?.[0] };
  },
});

/**
 * Get the count of unread messages in a conversation.
 */
export const getUnreadCount = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return 0;

    // Verify the user is a participant in this conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return 0;

    if (
      conversation.participant1Id !== currentUserId &&
      conversation.participant2Id !== currentUserId
    ) {
      throw new Error("Not authorized to view this conversation");
    }

    // Count unread messages from the other participant
    const messagesList = await ctx.db
      .query("messages")
      .withIndex("conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const unreadCount = messagesList.filter(
      (message) =>
        message.senderId !== currentUserId &&
        (message.read === false || !message.read)
    ).length;

    return unreadCount;
  },
});

/**
 * Get the total count of unread messages across all conversations for the current user.
 */
export const getTotalUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return 0;

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

    const allConversations = [
      ...conversationsAsParticipant1,
      ...conversationsAsParticipant2,
    ];

    let totalUnread = 0;

    // Count unread messages in each conversation
    for (const conversation of allConversations) {
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

      totalUnread += unreadCount;
    }

    return totalUnread;
  },
});

/**
 * Stop sharing an album immediately by setting its expiration to now.
 * Only the sender (album owner) can stop sharing.
 */
export const stopAlbumSharing = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Verify this is an album message
    if (!message.albumId) {
      throw new Error("This is not an album message");
    }

    // Only the sender (album owner) can stop sharing
    if (message.senderId !== currentUserId) {
      throw new Error("Only the album owner can stop sharing");
    }

    // Check if already expired
    const now = Date.now();
    if (message.albumExpiresAt && now > message.albumExpiresAt) {
      throw new Error("Album sharing has already expired");
    }

    // Set expiration to now (immediately expire the album access)
    await ctx.db.patch(args.messageId, {
      albumExpiresAt: now,
    });

    return { success: true };
  },
});

/**
 * Get album photos for a message. Returns the photos if the album is not expired,
 * or a locked status if it has expired.
 */
export const getAlbumPhotosForMessage = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return { locked: true, photos: [] };

    const message = await ctx.db.get(args.messageId);
    if (!message) return { locked: true, photos: [] };

    // Verify this is an album message
    if (!message.albumId) {
      return { locked: true, photos: [] };
    }

    // Verify the user is a participant in the conversation
    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) return { locked: true, photos: [] };

    if (
      conversation.participant1Id !== currentUserId &&
      conversation.participant2Id !== currentUserId
    ) {
      return { locked: true, photos: [] };
    }

    // Check if the album has expired
    const now = Date.now();
    if (message.albumExpiresAt && now > message.albumExpiresAt) {
      return { locked: true, photos: [] };
    }

    // Get the album photos
    const photos = await ctx.db
      .query("albumPhotos")
      .withIndex("albumId", (q) => q.eq("albumId", message.albumId!))
      .collect();

    return {
      locked: false,
      photos: photos.map((photo) => ({
        _id: photo._id,
        photoUrl: photo.photoUrl,
      })),
      albumTitle: message.albumTitle,
      expiresAt: message.albumExpiresAt,
    };
  },
});
