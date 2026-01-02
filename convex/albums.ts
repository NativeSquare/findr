import { getAuthUserId } from "@convex-dev/auth/server";
import { Triggers } from "convex-helpers/server/triggers";
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { generateMutations } from "./lib/mutations";

const triggers = new Triggers<DataModel>();

// Cascade deletion: when an album is deleted, delete all its photos
triggers.register("albums", async (ctx, change) => {
  if (change.operation === "delete") {
    for await (const photo of ctx.db
      .query("albumPhotos")
      .withIndex("albumId", (q) => q.eq("albumId", change.id))) {
      await ctx.db.delete(photo._id);
    }
  }
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Schema Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

const documentSchema = {
  userId: v.id("users"),
  title: v.string(),
  coverPhotoId: v.optional(v.id("albumPhotos")),
};

export const albums = defineTable(documentSchema).index("userId", ["userId"]);

// Album photos schema
const photoSchema = {
  albumId: v.id("albums"),
  photoUrl: v.string(),
  thumbnailUrl: v.optional(v.string()),
};

export const albumPhotos = defineTable(photoSchema).index("albumId", [
  "albumId",
]);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Mutations Definition ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

export const {
  delete: del,
  insert,
  patch,
  replace,
} = generateMutations("albums", documentSchema, triggers);

/**
 * Create a new album for the current user.
 */
export const createAlbum = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    if (!args.title || args.title.trim().length === 0) {
      throw new Error("Album title is required");
    }

    return await ctx.db.insert("albums", {
      userId: currentUserId,
      title: args.title.trim(),
    });
  },
});

/**
 * Get all albums for the current user.
 */
export const getAlbums = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return [];

    const albumsList = await ctx.db
      .query("albums")
      .withIndex("userId", (q) => q.eq("userId", currentUserId))
      .collect();

    // Get photo count and cover photo for each album
    const albumsWithPhotoCount = await Promise.all(
      albumsList.map(async (album) => {
        const photos = await ctx.db
          .query("albumPhotos")
          .withIndex("albumId", (q) => q.eq("albumId", album._id))
          .collect();

        // Get cover photo URL if coverPhotoId exists
        let coverPhotoUrl: string | undefined;
        if (album.coverPhotoId) {
          const coverPhoto = await ctx.db.get(album.coverPhotoId);
          if (coverPhoto) {
            coverPhotoUrl = coverPhoto.photoUrl;
          }
        } else if (photos.length > 0) {
          // Fallback to first photo if no cover is set
          coverPhotoUrl = photos[0].photoUrl;
        }

        // Get first 3 thumbnail photos (excluding the cover photo)
        const thumbnailPhotos = photos
          .filter((photo) => photo._id !== album.coverPhotoId)
          .slice(0, 3)
          .map((photo) => photo.photoUrl);

        return {
          ...album,
          photoCount: photos.length,
          coverPhotoUrl,
          thumbnailUrls: thumbnailPhotos,
        };
      })
    );

    // Sort by creation time (most recent first)
    return albumsWithPhotoCount.sort(
      (a, b) => b._creationTime - a._creationTime
    );
  },
});

/**
 * Get a single album by ID.
 */
export const getAlbum = query({
  args: {
    albumId: v.id("albums"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return null;

    const album = await ctx.db.get(args.albumId);
    if (!album) return null;

    // Check if user owns the album
    if (album.userId !== currentUserId) {
      throw new Error("Not authorized to view this album");
    }

    // Get all photos in the album
    const photos = await ctx.db
      .query("albumPhotos")
      .withIndex("albumId", (q) => q.eq("albumId", args.albumId))
      .collect();

    return {
      ...album,
      photos,
      photoCount: photos.length,
    };
  },
});

/**
 * Add a photo to an album.
 */
export const addPhotoToAlbum = mutation({
  args: {
    albumId: v.id("albums"),
    photoUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const album = await ctx.db.get(args.albumId);
    if (!album) {
      throw new Error("Album not found");
    }

    // Check if user owns the album
    if (album.userId !== currentUserId) {
      throw new Error("Not authorized to add photos to this album");
    }

    return await ctx.db.insert("albumPhotos", {
      albumId: args.albumId,
      photoUrl: args.photoUrl,
      thumbnailUrl: args.thumbnailUrl,
    });
  },
});

/**
 * Delete a photo from an album.
 */
export const deletePhotoFromAlbum = mutation({
  args: {
    photoId: v.id("albumPhotos"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const photo = await ctx.db.get(args.photoId);
    if (!photo) {
      throw new Error("Photo not found");
    }

    const album = await ctx.db.get(photo.albumId);
    if (!album) {
      throw new Error("Album not found");
    }

    // Check if user owns the album
    if (album.userId !== currentUserId) {
      throw new Error("Not authorized to delete photos from this album");
    }

    await ctx.db.delete(args.photoId);
  },
});

/**
 * Set a photo as the cover photo of an album.
 */
export const setCoverPhoto = mutation({
  args: {
    albumId: v.id("albums"),
    photoId: v.id("albumPhotos"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const album = await ctx.db.get(args.albumId);
    if (!album) {
      throw new Error("Album not found");
    }

    // Check if user owns the album
    if (album.userId !== currentUserId) {
      throw new Error("Not authorized to modify this album");
    }

    const photo = await ctx.db.get(args.photoId);
    if (!photo) {
      throw new Error("Photo not found");
    }

    // Check if photo belongs to the album
    if (photo.albumId !== args.albumId) {
      throw new Error("Photo does not belong to this album");
    }

    await ctx.db.patch(args.albumId, {
      coverPhotoId: args.photoId,
    });
  },
});

/**
 * Delete an album and all its photos.
 */
export const deleteAlbum = mutation({
  args: {
    albumId: v.id("albums"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const album = await ctx.db.get(args.albumId);
    if (!album) {
      throw new Error("Album not found");
    }

    // Check if user owns the album
    if (album.userId !== currentUserId) {
      throw new Error("Not authorized to delete this album");
    }

    // Delete the album (triggers will handle deleting photos)
    await ctx.db.delete(args.albumId);
  },
});
