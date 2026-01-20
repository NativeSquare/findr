import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useConvex, useMutation } from "convex/react";
import * as ImageManipulator from "expo-image-manipulator";
import React from "react";

export type UploadImageOptions = {
  /** Max width to resize to (maintains aspect ratio). Default: 1024 */
  width?: number;
  /** Compression quality 0-1. Default: 0.8 */
  compress?: number;
  /** Output format. Default: JPEG */
  format?: ImageManipulator.SaveFormat;
};

export type UploadResult = {
  storageId: Id<"_storage">;
  url: string;
};

export function useUploadImage() {
  const convex = useConvex();
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [isUploading, setIsUploading] = React.useState(false);

  /**
   * Uploads an image and returns both the storage ID and URL.
   * Use storageId when you need to store the reference in the database.
   * Use url when you need to display the image immediately.
   */
  const uploadImageWithId = React.useCallback(
    async (uri: string, options?: UploadImageOptions): Promise<UploadResult> => {
      const {
        width = 1024,
        compress = 0.8,
        format = ImageManipulator.SaveFormat.JPEG,
      } = options ?? {};

      setIsUploading(true);

      try {
        // Compress and resize image before upload (maintaining aspect ratio)
        const image = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width } }],
          { compress, format }
        );

        const response = await fetch(image.uri);
        const blob = await response.blob();

        const uploadUrl = await generateUploadUrl();
        const contentType =
          format === ImageManipulator.SaveFormat.PNG
            ? "image/png"
            : "image/jpeg";

        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": contentType },
          body: blob,
        });

        const { storageId } = (await uploadResult.json()) as {
          storageId: Id<"_storage">;
        };

        // Get the public URL from the storage ID
        const url = await convex.query(api.storage.getImageUrl, {
          storageId,
        });

        if (!url) {
          throw new Error("Failed to get image URL from storage");
        }

        return { storageId, url };
      } finally {
        setIsUploading(false);
      }
    },
    [convex, generateUploadUrl]
  );

  /**
   * Uploads an image and returns the public URL.
   * Use this for user-facing images (profile pictures, etc.)
   */
  const uploadImage = React.useCallback(
    async (uri: string, options?: UploadImageOptions): Promise<string> => {
      const result = await uploadImageWithId(uri, options);
      return result.url;
    },
    [uploadImageWithId]
  );

  const uploadImages = React.useCallback(
    async (uris: string[], options?: UploadImageOptions): Promise<string[]> => {
      setIsUploading(true);
      try {
        return await Promise.all(uris.map((uri) => uploadImage(uri, options)));
      } finally {
        setIsUploading(false);
      }
    },
    [uploadImage]
  );

  /**
   * Uploads multiple images and returns both storage IDs and URLs.
   * Use this when you need to store references in the database.
   */
  const uploadImagesWithIds = React.useCallback(
    async (uris: string[], options?: UploadImageOptions): Promise<UploadResult[]> => {
      setIsUploading(true);
      try {
        return await Promise.all(uris.map((uri) => uploadImageWithId(uri, options)));
      } finally {
        setIsUploading(false);
      }
    },
    [uploadImageWithId]
  );

  return {
    uploadImage,
    uploadImages,
    uploadImageWithId,
    uploadImagesWithIds,
    isUploading,
  };
}
