import { GeospatialIndex } from "@convex-dev/geospatial";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

type GeospatialFilterKeys = {
  // Body Types
  bodyTypesSlim?: string;
  bodyTypesAverage?: string;
  bodyTypesAthletic?: string;
  bodyTypesMuscular?: string;
  bodyTypesStocky?: string;
  // Ethnicity
  ethnicityAsian?: string;
  ethnicityBlack?: string;
  ethnicityLatinoHispanic?: string;
  ethnicityMiddleEastern?: string;
  ethnicityMixed?: string;
  ethnicityNativeAmerican?: string;
  ethnicityPacificIslander?: string;
  ethnicitySouthAsian?: string;
  ethnicityWhite?: string;
  ethnicityOther?: string;
  // Looking For
  lookingForConnections?: string;
  lookingForFriends?: string;
  lookingForDating?: string;
  // Position
  positionTop?: string;
  positionBottom?: string;
  positionVersatile?: string;
  positionSide?: string;
  positionAskMe?: string;
  // Orientation
  orientation?: string;
};

const geospatial = new GeospatialIndex<Id<"users">>(components.geospatial);

export const updateUserLocation = mutation({
  args: { id: v.id("users"), latitude: v.number(), longitude: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("User not found");

    return await geospatial.insert(
      ctx,
      args.id,
      { latitude: args.latitude, longitude: args.longitude },
      {}
    );
  },
});

function intersects(
  userVals: string[] | undefined,
  filterVals: string[] | undefined
) {
  if (!filterVals?.length) return true; // no filter => pass
  if (!userVals?.length) return false; // filter set but user has none => fail
  const set = new Set(userVals);
  return filterVals.some((v) => set.has(v));
}

function matchesFilters(
  user: {
    bodyTypes?: string[] | null;
    ethnicity?: string[] | null;
    lookingFor?: string[] | null;
    position?: string[] | null;
    orientation?: string | null;
  },
  filters?: {
    bodyTypes?: string[];
    ethnicity?: string[];
    lookingFor?: string[];
    position?: string[];
    orientation?: string;
  }
) {
  if (!filters) return true;

  if (filters.orientation && user.orientation !== filters.orientation)
    return false;

  if (!intersects(user.bodyTypes ?? undefined, filters.bodyTypes)) return false;
  if (!intersects(user.ethnicity ?? undefined, filters.ethnicity)) return false;
  if (!intersects(user.lookingFor ?? undefined, filters.lookingFor))
    return false;
  if (!intersects(user.position ?? undefined, filters.position)) return false;

  return true;
}

export const getNearestUsers = query({
  args: {
    id: v.id("users"),
    filters: v.optional(
      v.object({
        maxDistance: v.optional(v.number()),
        bodyTypes: v.optional(v.array(v.string())),
        ethnicity: v.optional(v.array(v.string())),
        lookingFor: v.optional(v.array(v.string())),
        position: v.optional(v.array(v.string())),
        orientation: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const maxResults = 10000;
    const maxDistance = args.filters?.maxDistance ?? 10000;

    const geo = await geospatial.get(ctx, args.id);
    if (!geo) return [];

    const result = await geospatial.nearest(ctx, {
      point: geo.coordinates,
      limit: maxResults + 1, // +1 so we can exclude self and still return maxResults
      maxDistance,
      // We tried the filterKeys method, but it doesn't allow multiple in() statements as we speak (12/2025). We needed them for making filters like : "position IN […] and ethnicity IN […] and lookingFor IN […]". Sequencing eq() statements is not possible either because doing so results in AND statements instead of OR statements. For example : q.eq("position", "top").eq("position", "bottom") means getting users with : "position is top AND position is bottom", which is not what we want.
    });

    const resolvedUsers = await Promise.all(
      result
        // Exclude self
        .filter((item) => item.key !== args.id)
        .map(async (item) => {
          const user = await ctx.db.get(item.key);
          if (!user) return null;
          if (!matchesFilters(user, args.filters)) return null;
          return {
            ...user,
            distance: item.distance,
          };
        })
    );

    return resolvedUsers.filter((user) => user !== null);
  },
});
