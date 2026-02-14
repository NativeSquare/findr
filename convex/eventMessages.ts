import { getAuthUserId } from "@convex-dev/auth/server";
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Schema Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

const documentSchema = {
  eventId: v.id("events"),
  senderId: v.id("users"),
  text: v.string(),
};

export const eventMessages = defineTable(documentSchema).index("eventId", [
  "eventId",
]);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Mutations Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

const MAX_MESSAGE_LENGTH = 5000;

/**
 * Send a message to an event's group chat.
 * Only attendees and the organizer can send messages.
 */
export const sendMessage = mutation({
  args: {
    eventId: v.id("events"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Validate text
    const trimmedText = args.text.trim();
    if (!trimmedText) {
      throw new Error("Message text cannot be empty");
    }
    if (trimmedText.length > MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Message text cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
      );
    }

    // Verify the event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is the organizer
    const isOrganizer = event.organizerId === currentUserId;

    // Check if user is an attendee
    if (!isOrganizer) {
      const attendee = await ctx.db
        .query("eventAttendees")
        .withIndex("eventId_userId", (q) =>
          q.eq("eventId", args.eventId).eq("userId", currentUserId),
        )
        .first();

      if (!attendee) {
        throw new Error("You must be an attendee or organizer to send messages");
      }
    }

    // Insert message
    const messageId = await ctx.db.insert("eventMessages", {
      eventId: args.eventId,
      senderId: currentUserId,
      text: trimmedText,
    });

    return messageId;
  },
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Queries Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

/**
 * Get all messages for an event's group chat, ordered by creation time (oldest first).
 * Only attendees and the organizer can view messages.
 * Returns messages enriched with sender name and avatar.
 */
export const getMessages = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return [];

    // Verify the event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) return [];

    // Check if user is the organizer or an attendee
    const isOrganizer = event.organizerId === currentUserId;
    if (!isOrganizer) {
      const attendee = await ctx.db
        .query("eventAttendees")
        .withIndex("eventId_userId", (q) =>
          q.eq("eventId", args.eventId).eq("userId", currentUserId),
        )
        .first();

      if (!attendee) return [];
    }

    // Get all messages for this event
    const messages = await ctx.db
      .query("eventMessages")
      .withIndex("eventId", (q) => q.eq("eventId", args.eventId))
      .order("asc")
      .collect();

    // Resolve sender info for each message, using a cache to avoid duplicate lookups
    const senderCache = new Map<
      string,
      { name: string; avatarUrl: string | null }
    >();

    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        let senderInfo = senderCache.get(message.senderId);

        if (!senderInfo) {
          const user = await ctx.db.get(message.senderId);
          let avatarUrl: string | null = null;
          if (user?.profilePictures?.length) {
            avatarUrl =
              (await ctx.storage.getUrl(user.profilePictures[0])) ?? null;
          }
          senderInfo = {
            name: user?.name ?? "Unknown",
            avatarUrl,
          };
          senderCache.set(message.senderId, senderInfo);
        }

        return {
          _id: message._id,
          text: message.text,
          timestamp: message._creationTime,
          isOutgoing: message.senderId === currentUserId,
          senderName: senderInfo.name,
          senderAvatarUrl: senderInfo.avatarUrl,
        };
      }),
    );

    return enrichedMessages;
  },
});

/**
 * Get event group chats for the current user.
 * Returns events the user has joined or organized that have messages,
 * sorted by most recent message time.
 */
export const getEventChats = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return [];

    // Get events where user is an attendee
    const attendeeRecords = await ctx.db
      .query("eventAttendees")
      .withIndex("userId", (q) => q.eq("userId", currentUserId))
      .collect();

    const attendeeEventIds = new Set(attendeeRecords.map((a) => a.eventId));

    // Get events where user is the organizer
    const organizedEvents = await ctx.db
      .query("events")
      .withIndex("organizerId", (q) => q.eq("organizerId", currentUserId))
      .collect();

    // Combine all event IDs (deduped)
    for (const event of organizedEvents) {
      attendeeEventIds.add(event._id);
    }

    const allEventIds = Array.from(attendeeEventIds);

    // For each event, get the last message and event info
    const eventChats = await Promise.all(
      allEventIds.map(async (eventId) => {
        const event = await ctx.db.get(eventId);
        if (!event) return null;

        // Get the most recent message for this event
        const lastMessage = await ctx.db
          .query("eventMessages")
          .withIndex("eventId", (q) => q.eq("eventId", eventId))
          .order("desc")
          .first();

        // Skip events with no messages
        if (!lastMessage) return null;

        // Get sender name for last message
        const sender = await ctx.db.get(lastMessage.senderId);
        const senderName = sender?.name ?? "Unknown";
        const isOwnMessage = lastMessage.senderId === currentUserId;

        return {
          eventId: event._id,
          eventTitle: event.title,
          eventImageUrl: event.imageUrl ?? null,
          lastMessage: isOwnMessage
            ? `You: ${lastMessage.text}`
            : `${senderName}: ${lastMessage.text}`,
          lastMessageTime: lastMessage._creationTime,
        };
      }),
    );

    // Filter out nulls and sort by most recent message
    return eventChats
      .filter((chat): chat is NonNullable<typeof chat> => chat !== null)
      .sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  },
});
