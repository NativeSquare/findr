import { getAuthUserId } from "@convex-dev/auth/server";
import { Presence } from "@convex-dev/presence";
import { PresenceState } from "@convex-dev/presence/react-native";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const presence = new Presence(components.presence);

export const heartbeat = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
    sessionId: v.string(),
    interval: v.number(),
  },
  handler: async (ctx, { roomId, userId, sessionId, interval }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (userId !== currentUserId)
      throw new Error("Cannot heartbeat for another user");

    return await presence.heartbeat(ctx, roomId, userId, sessionId, interval);
  },
});

export const list = query({
  args: { roomToken: v.string() },
  handler: async (ctx, { roomToken }) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Must be logged in to view presence");

    const peeps = await presence.list(ctx, roomToken);

    const peepsWithNames = await Promise.all(
      peeps.map(async (p) => {
        const user = await ctx.db.get(p.userId as Id<"users">);
        if (!user) return null;
        return {
          ...p,
          name: user.email ?? "Unknown",
        } as PresenceState;
      })
    );
    return peepsWithNames.filter((p) => p !== null);
  },
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    return await presence.disconnect(ctx, sessionToken);
  },
});
