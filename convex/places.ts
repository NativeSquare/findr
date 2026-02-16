// convex/places.ts
import { v } from "convex/values";
import { action } from "./_generated/server";

export const autocomplete = action({
  args: { input: v.string(), sessionToken: v.string() },
  handler: async (_ctx, { input, sessionToken }) => {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!, // stored in Convex env
          // Field masks optional for autocomplete, but good practice to limit payload:
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
        },
        body: JSON.stringify({
          input,
          sessionToken,
          // optional:
          // languageCode: "fr",
          // includedPrimaryTypes: ["geocode", "establishment"],
        }),
      }
    );

    const data = await res.json();
    if (!res.ok)
      throw new Error(data?.error?.message ?? "Places autocomplete failed");
    return data;
  },
});

export const autocompleteCities = action({
  args: { input: v.string(), sessionToken: v.string() },
  handler: async (_ctx, { input, sessionToken }) => {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
        },
        body: JSON.stringify({
          input,
          sessionToken,
          includedPrimaryTypes: ["(cities)"],
        }),
      }
    );

    const data = await res.json();
    if (!res.ok)
      throw new Error(data?.error?.message ?? "Places autocomplete failed");
    return data;
  },
});

export const details = action({
  args: { placeId: v.string() },
  handler: async (_ctx, { placeId }) => {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
          "X-Goog-FieldMask": "id,displayName,formattedAddress,location",
        },
      }
    );

    const data = await res.json();
    if (!res.ok)
      throw new Error(data?.error?.message ?? "Place details failed");
    return data;
  },
});
