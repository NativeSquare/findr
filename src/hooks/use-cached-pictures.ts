import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as React from "react";

const CACHE_STORAGE_KEY = "cached_pictures";
const CACHE_DIRECTORY = `${FileSystem.cacheDirectory}cached_pictures/`;
const MAX_CACHED_PICTURES = 20;

export type CachedPicture = {
  id: string;
  localUri: string;
  originalUri: string;
  timestamp: number;
  width?: number;
  height?: number;
};

async function ensureCacheDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIRECTORY, { intermediates: true });
  }
}

async function getStoredPictures(): Promise<CachedPicture[]> {
  try {
    const data = await AsyncStorage.getItem(CACHE_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as CachedPicture[];
  } catch {
    return [];
  }
}

async function saveStoredPictures(pictures: CachedPicture[]): Promise<void> {
  await AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(pictures));
}

export type AddToCacheParams = {
  uri: string;
  width?: number;
  height?: number;
};

/**
 * Hook for managing locally cached pictures.
 * Pictures are stored in the app's cache directory with metadata in AsyncStorage.
 */
export function useCachedPictures() {
  const [cachedPictures, setCachedPictures] = React.useState<CachedPicture[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load cached pictures on mount
  React.useEffect(() => {
    loadCachedPictures();
  }, []);

  const loadCachedPictures = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const pictures = await getStoredPictures();
      // Verify files still exist and filter out any that don't
      const validPictures: CachedPicture[] = [];
      for (const pic of pictures) {
        const fileInfo = await FileSystem.getInfoAsync(pic.localUri);
        if (fileInfo.exists) {
          validPictures.push(pic);
        }
      }
      // Update storage if any files were missing
      if (validPictures.length !== pictures.length) {
        await saveStoredPictures(validPictures);
      }
      setCachedPictures(validPictures);
    } catch (error) {
      console.error("Error loading cached pictures:", error);
      setCachedPictures([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCache = React.useCallback(
    async (params: AddToCacheParams): Promise<CachedPicture | null> => {
      try {
        await ensureCacheDirectory();

        const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const extension = params.uri.split(".").pop() || "jpg";
        const localUri = `${CACHE_DIRECTORY}${id}.${extension}`;

        // Copy the file to cache directory
        await FileSystem.copyAsync({
          from: params.uri,
          to: localUri,
        });

        const newPicture: CachedPicture = {
          id,
          localUri,
          originalUri: params.uri,
          timestamp: Date.now(),
          width: params.width,
          height: params.height,
        };

        // Get current pictures and add new one at the beginning
        const currentPictures = await getStoredPictures();
        let updatedPictures = [newPicture, ...currentPictures];

        // Enforce max limit - remove oldest pictures if over limit
        if (updatedPictures.length > MAX_CACHED_PICTURES) {
          const picturesToRemove = updatedPictures.slice(MAX_CACHED_PICTURES);
          updatedPictures = updatedPictures.slice(0, MAX_CACHED_PICTURES);

          // Delete old files
          for (const pic of picturesToRemove) {
            try {
              await FileSystem.deleteAsync(pic.localUri, { idempotent: true });
            } catch {
              // Ignore deletion errors
            }
          }
        }

        await saveStoredPictures(updatedPictures);
        setCachedPictures(updatedPictures);

        return newPicture;
      } catch (error) {
        console.error("Error adding picture to cache:", error);
        return null;
      }
    },
    []
  );

  const removeFromCache = React.useCallback(async (id: string): Promise<void> => {
    try {
      const currentPictures = await getStoredPictures();
      const pictureToRemove = currentPictures.find((p) => p.id === id);

      if (pictureToRemove) {
        // Delete the file
        await FileSystem.deleteAsync(pictureToRemove.localUri, { idempotent: true });
      }

      const updatedPictures = currentPictures.filter((p) => p.id !== id);
      await saveStoredPictures(updatedPictures);
      setCachedPictures(updatedPictures);
    } catch (error) {
      console.error("Error removing picture from cache:", error);
    }
  }, []);

  const clearCache = React.useCallback(async (): Promise<void> => {
    try {
      const currentPictures = await getStoredPictures();

      // Delete all cached files
      for (const pic of currentPictures) {
        try {
          await FileSystem.deleteAsync(pic.localUri, { idempotent: true });
        } catch {
          // Ignore individual deletion errors
        }
      }

      // Clear the entire cache directory to be thorough
      try {
        await FileSystem.deleteAsync(CACHE_DIRECTORY, { idempotent: true });
      } catch {
        // Ignore if directory doesn't exist
      }

      await saveStoredPictures([]);
      setCachedPictures([]);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }, []);

  return {
    cachedPictures,
    isLoading,
    addToCache,
    removeFromCache,
    clearCache,
    refreshCache: loadCachedPictures,
  };
}
