import { getAuthUserId } from "@convex-dev/auth/server";
import { Triggers } from "convex-helpers/server/triggers";
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { generateMutations } from "./lib/mutations";

const triggers = new Triggers<DataModel>();

// Cascade deletion: when an event is deleted, delete all its attendees
triggers.register("events", async (ctx, change) => {
  if (change.operation === "delete") {
    for await (const attendee of ctx.db
      .query("eventAttendees")
      .withIndex("eventId", (q) => q.eq("eventId", change.id))) {
      await ctx.db.delete(attendee._id);
    }
  }
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Schema Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

const documentSchema = {
  organizerId: v.id("users"),
  title: v.string(),
  location: v.string(),
  date: v.number(), // Unix timestamp (ms) combining date + time
  description: v.optional(v.string()),
  maxAttendees: v.optional(v.number()),
  imageUrl: v.optional(v.string()),
  eventType: v.optional(v.string()),
  socialLinks: v.optional(
    v.object({
      instagram: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      facebook: v.optional(v.string()),
    })
  ),
};

export const events = defineTable(documentSchema)
  .index("organizerId", ["organizerId"])
  .index("date", ["date"]);

// Event attendees schema
const attendeeSchema = {
  eventId: v.id("events"),
  userId: v.id("users"),
};

export const eventAttendees = defineTable(attendeeSchema)
  .index("eventId", ["eventId"])
  .index("userId", ["userId"])
  .index("eventId_userId", ["eventId", "userId"]);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Mutations Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

export const {
  delete: del,
  insert,
  patch,
  replace,
} = generateMutations("events", documentSchema, triggers);

/**
 * Create a new event for the current user.
 */
export const createEvent = mutation({
  args: {
    title: v.string(),
    location: v.string(),
    date: v.number(),
    description: v.optional(v.string()),
    maxAttendees: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    eventType: v.optional(v.string()),
    socialLinks: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        tiktok: v.optional(v.string()),
        facebook: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    if (!args.title.trim()) {
      throw new Error("Event title is required");
    }
    if (!args.location.trim()) {
      throw new Error("Event location is required");
    }

    const eventId = await ctx.db.insert("events", {
      organizerId: currentUserId,
      title: args.title.trim(),
      location: args.location.trim(),
      date: args.date,
      description: args.description?.trim(),
      maxAttendees: args.maxAttendees,
      imageUrl: args.imageUrl,
      eventType: args.eventType,
      socialLinks: args.socialLinks,
    });

    // Organizer automatically joins their own event
    await ctx.db.insert("eventAttendees", {
      eventId,
      userId: currentUserId,
    });

    return eventId;
  },
});

/**
 * Get events grouped by today, upcoming, and previous.
 */
export const getEvents = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return { today: [], upcoming: [], previous: [] };

    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const allEvents = await ctx.db
      .query("events")
      .withIndex("date")
      .collect();

    // Enrich events with attendee info and organizer data
    const enrichedEvents = await Promise.all(
      allEvents.map(async (event) => {
        const attendees = await ctx.db
          .query("eventAttendees")
          .withIndex("eventId", (q) => q.eq("eventId", event._id))
          .collect();

        const organizer = await ctx.db.get(event.organizerId);

        // Get attendee avatar URLs (up to 5)
        const attendeeUsers = await Promise.all(
          attendees.slice(0, 5).map(async (a) => {
            const user = await ctx.db.get(a.userId);
            if (!user?.profilePictures?.length) return null;
            return ctx.storage.getUrl(user.profilePictures[0]);
          })
        );

        // Check if current user has joined
        const hasJoined = attendees.some((a) => a.userId === currentUserId);

        return {
          _id: event._id,
          title: event.title,
          date: event.date,
          location: event.location,
          imageUrl: event.imageUrl,
          description: event.description,
          eventType: event.eventType,
          maxAttendees: event.maxAttendees,
          socialLinks: event.socialLinks,
          organizerId: event.organizerId,
          organizerName: organizer?.name ?? "Unknown",
          organizerAvatarUrl: organizer?.profilePictures?.length
            ? await ctx.storage.getUrl(organizer.profilePictures[0])
            : null,
          attendeeAvatars: attendeeUsers.filter(Boolean) as string[],
          totalAttendees: attendees.length,
          hasJoined,
          _creationTime: event._creationTime,
        };
      })
    );

    const today = enrichedEvents
      .filter(
        (e) =>
          e.date >= startOfToday.getTime() && e.date <= endOfToday.getTime()
      )
      .sort((a, b) => a.date - b.date);

    const upcoming = enrichedEvents
      .filter((e) => e.date > endOfToday.getTime())
      .sort((a, b) => a.date - b.date);

    const previous = enrichedEvents
      .filter((e) => e.date < startOfToday.getTime())
      .sort((a, b) => b.date - a.date);

    return { today, upcoming, previous };
  },
});

/**
 * Get a single event by ID with full details.
 */
export const getEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return null;

    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const organizer = await ctx.db.get(event.organizerId);

    const attendees = await ctx.db
      .query("eventAttendees")
      .withIndex("eventId", (q) => q.eq("eventId", event._id))
      .collect();

    // Get attendee avatar URLs (up to 5)
    const attendeeUsers = await Promise.all(
      attendees.slice(0, 5).map(async (a) => {
        const user = await ctx.db.get(a.userId);
        if (!user?.profilePictures?.length) return null;
        return ctx.storage.getUrl(user.profilePictures[0]);
      })
    );

    const hasJoined = attendees.some((a) => a.userId === currentUserId);
    const isOrganizer = event.organizerId === currentUserId;

    return {
      ...event,
      organizerName: organizer?.name ?? "Unknown",
      organizerAvatarUrl: organizer?.profilePictures?.length
        ? await ctx.storage.getUrl(organizer.profilePictures[0])
        : null,
      attendeeAvatars: attendeeUsers.filter(Boolean) as string[],
      totalAttendees: attendees.length,
      hasJoined,
      isOrganizer,
    };
  },
});

/**
 * Join an event.
 */
export const joinEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if already joined
    const existing = await ctx.db
      .query("eventAttendees")
      .withIndex("eventId_userId", (q) =>
        q.eq("eventId", args.eventId).eq("userId", currentUserId)
      )
      .first();

    if (existing) {
      throw new Error("Already joined this event");
    }

    // Check max attendees limit
    if (event.maxAttendees) {
      const attendeeCount = await ctx.db
        .query("eventAttendees")
        .withIndex("eventId", (q) => q.eq("eventId", args.eventId))
        .collect();

      if (attendeeCount.length >= event.maxAttendees) {
        throw new Error("Event is full");
      }
    }

    await ctx.db.insert("eventAttendees", {
      eventId: args.eventId,
      userId: currentUserId,
    });
  },
});

/**
 * Leave an event.
 */
export const leaveEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Organizer cannot leave their own event
    if (event.organizerId === currentUserId) {
      throw new Error("Organizer cannot leave their own event");
    }

    const existing = await ctx.db
      .query("eventAttendees")
      .withIndex("eventId_userId", (q) =>
        q.eq("eventId", args.eventId).eq("userId", currentUserId)
      )
      .first();

    if (!existing) {
      throw new Error("Not attending this event");
    }

    await ctx.db.delete(existing._id);
  },
});

/**
 * Delete an event (organizer only).
 */
export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.organizerId !== currentUserId) {
      throw new Error("Only the organizer can delete this event");
    }

    // Delete attendees first
    const attendees = await ctx.db
      .query("eventAttendees")
      .withIndex("eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const attendee of attendees) {
      await ctx.db.delete(attendee._id);
    }

    await ctx.db.delete(args.eventId);
  },
});
