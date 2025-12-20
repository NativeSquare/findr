import { GeospatialIndex } from "@convex-dev/geospatial";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

const geospatial = new GeospatialIndex<Id<"users">, {}>(components.geospatial);

export const updateUserLocation = mutation({
  args: { id: v.id("users"), latitude: v.number(), longitude: v.number() },
  handler: async (ctx, args) => {
    return await geospatial.insert(
      ctx,
      args.id,
      { latitude: args.latitude, longitude: args.longitude },
      {}
    );
  },
});

export const getNearestUsers = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const maxResults = 16;
    const maxDistance = 10000;
    const geo = await geospatial.get(ctx, args.id);
    if (!geo) return [];
    const result = await geospatial.nearest(ctx, {
      point: geo.coordinates,
      limit: maxResults,
      maxDistance,
    });
    return result;
  },
});
