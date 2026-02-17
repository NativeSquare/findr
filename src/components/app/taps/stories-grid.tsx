import { UploadMediaBottomSheetModal } from "@/components/shared/upload-media-bottom-sheet-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { useUploadImage } from "@/hooks/use-upload-image";
import { usePresence } from "@convex-dev/presence/react-native";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import type { ImagePickerAsset } from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  View,
} from "react-native";

export type StoriesGridProps = {
  user: Doc<"users">;
};

export function StoriesGrid({ user }: StoriesGridProps) {
  const uploadMediaRef = React.useRef<GorhomBottomSheetModal>(null);
  const { uploadImageWithId, isUploading } = useUploadImage();
  const createStory = useMutation(api.stories.createStory);
  const presenceState = usePresence(api.presence, "public", user._id);

  const storyGroups = useQuery(
    api.geospatial.getNearbyStories,
    user._id ? { userId: user._id } : "skip",
  );

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
    const authorIds = storyGroups.map((group) => group.authorId);
    router.push({
      pathname: "/story-viewer",
      params: {
        startUserId: authorId,
        authorIds: JSON.stringify(authorIds),
      },
    });
  };

  const screenWidth = Dimensions.get("window").width;
  const maxWidth = 384;
  const containerWidth = Math.min(screenWidth, maxWidth);
  const padding = 40; // px-5 on each side (20px * 2)
  const gap = 6;
  const gapsTotal = (3 - 1) * gap;
  const itemWidth = (containerWidth - padding - gapsTotal) / 3;

  if (!storyGroups) {
    return (
      <View className="py-8 items-center">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  const allGroups = storyGroups;

  if (allGroups.length === 0) {
    return (
      <View className="items-center gap-4 py-8">
        <Text className="text-muted-foreground">No stories nearby</Text>
        <Pressable
          onPress={handleAddStoryPress}
          className="flex-row items-center gap-2 rounded-full bg-[#e56400] px-5 py-2.5"
        >
          <Plus size={18} color="#000" />
          <Text className="text-sm font-medium text-black">Add Story</Text>
        </Pressable>
        <UploadMediaBottomSheetModal
          bottomSheetModalRef={uploadMediaRef}
          onImageSelected={handleImageSelected}
          options={["camera", "gallery"]}
          cacheOnSelect
        />
      </View>
    );
  }

  // Build rows of 3
  const rows: (typeof allGroups)[] = [];
  for (let i = 0; i < allGroups.length; i += 3) {
    rows.push(allGroups.slice(i, i + 3));
  }

  return (
    <View className="gap-1.5">
      {/* Add story button */}
      <Pressable
        onPress={handleAddStoryPress}
        className="mb-2 flex-row items-center gap-2 self-start rounded-full bg-[#e56400] px-4 py-2"
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Plus size={16} color="#000" />
        )}
        <Text className="text-sm font-medium text-black">Add Story</Text>
      </Pressable>

      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-1.5">
          {row.map((group) => {
            const userPresence = (presenceState || []).find(
              (state) => state.userId === group.authorId,
            );
            const isOnline = userPresence?.online ?? false;
            const displayName =
              group.authorId === user._id ? "Your Story" : group.authorName;

            return (
              <Pressable
                key={group.authorId}
                onPress={() => handleStoryPress(group.authorId)}
                style={{ width: itemWidth }}
                className="relative aspect-square rounded-xl border-2 border-[#E56400]"
              >
                <View className="flex-1 overflow-hidden rounded-[10px]">
                  <Avatar
                    alt={displayName}
                    className="size-full items-center justify-center rounded-none bg-secondary/60"
                  >
                    {group.authorAvatarUrl ? (
                      <AvatarImage source={{ uri: group.authorAvatarUrl }} />
                    ) : (
                      <AvatarFallback className="rounded-none bg-secondary/60">
                        <Ionicons
                          name="person"
                          size={48}
                          className="text-muted-foreground"
                        />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <LinearGradient
                    colors={[
                      "transparent",
                      "rgba(0,0,0,0.7)",
                      "rgba(0,0,0,0.9)",
                    ]}
                    locations={[0, 0.5, 1]}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 96,
                    }}
                  />
                  <View className="absolute bottom-2 left-2 right-2 flex-col">
                    <View className="flex-row items-center gap-2">
                      <View
                        className={
                          isOnline
                            ? "size-2 shrink-0 rounded-full bg-green-500"
                            : "size-2 shrink-0 rounded-full bg-gray-500"
                        }
                      />
                      <Text
                        className="flex-1 text-sm font-medium text-white"
                        numberOfLines={1}
                      >
                        {displayName}
                      </Text>
                    </View>
                    <Text className="text-xs font-normal text-white">
                      {group.stories.length}{" "}
                      {group.stories.length === 1 ? "story" : "stories"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}

      <UploadMediaBottomSheetModal
        bottomSheetModalRef={uploadMediaRef}
        onImageSelected={handleImageSelected}
        options={["camera", "gallery"]}
        cacheOnSelect
      />
    </View>
  );
}
