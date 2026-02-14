import { UploadMediaBottomSheetModal } from "@/components/shared/upload-media-bottom-sheet-modal";
import { useUploadImage } from "@/hooks/use-upload-image";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import type { ImagePickerAsset } from "expo-image-picker";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, FlatList, View } from "react-native";
import { StoryAvatar } from "./story-avatar";

export type StoryTrayProps = {
  user: Doc<"users">;
  searchLocation?: {
    latitude: number;
    longitude: number;
  } | null;
};

export function StoryTray({ user, searchLocation }: StoryTrayProps) {
  const uploadMediaRef = React.useRef<GorhomBottomSheetModal>(null);
  const { uploadImageWithId, isUploading } = useUploadImage();
  const createStory = useMutation(api.stories.createStory);

  const currentUserAvatarUrl = useQuery(
    api.storage.getImageUrl,
    user.profilePictures?.[0] ? { storageId: user.profilePictures[0] } : "skip",
  );

  const storyGroups = useQuery(
    api.geospatial.getNearbyStories,
    user._id
      ? {
          userId: user._id,
          customLocation: searchLocation ?? undefined,
        }
      : "skip",
  );

  const currentUserHasStories =
    storyGroups?.some((group) => group.authorId === user._id) ?? false;

  const handleAddStoryPress = () => {
    uploadMediaRef.current?.present();
  };

  const handleImageSelected = async (image: ImagePickerAsset) => {
    try {
      const result = await uploadImageWithId(image.uri);
      await createStory({ imageStorageId: result.storageId });
    } catch (error: any) {
      Alert.alert("Error", error.message ?? "Failed to create story");
    }
  };

  const handleStoryPress = (authorId: Id<"users">) => {
    if (!storyGroups) return;

    // Get ordered list of author IDs (excluding current user if they have no stories)
    const authorIds = storyGroups.map((group) => group.authorId);

    router.push({
      pathname: "/story-viewer",
      params: {
        startUserId: authorId,
        authorIds: JSON.stringify(authorIds),
      },
    });
  };

  // Build the list: current user first (always), then other story groups
  const otherStoryGroups =
    storyGroups?.filter((group) => group.authorId !== user._id) ?? [];

  return (
    <View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
        data={otherStoryGroups}
        keyExtractor={(item) => item.authorId}
        ListHeaderComponent={
          <View className="flex-row items-start gap-3">
            {/* Current user - always shown, with "+" icon */}
            <View>
              {isUploading && (
                <View className="absolute inset-0 z-10 items-center justify-center rounded-full">
                  <ActivityIndicator size="small" color="#E56400" />
                </View>
              )}
              <StoryAvatar
                name="Your Story"
                avatarUrl={currentUserAvatarUrl ?? null}
                showAddIcon={!isUploading}
                hasStoryRing={currentUserHasStories}
                onPress={
                  currentUserHasStories
                    ? () => handleStoryPress(user._id)
                    : handleAddStoryPress
                }
                onAddPress={handleAddStoryPress}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <StoryAvatar
            name={item.authorName}
            avatarUrl={item.authorAvatarUrl}
            hasStoryRing
            onPress={() => handleStoryPress(item.authorId)}
          />
        )}
      />

      <UploadMediaBottomSheetModal
        bottomSheetModalRef={uploadMediaRef}
        onImageSelected={handleImageSelected}
        options={["camera", "gallery"]}
        cacheOnSelect
      />
    </View>
  );
}
