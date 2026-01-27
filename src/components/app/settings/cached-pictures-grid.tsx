import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { CachedPicture } from "@/hooks/use-cached-pictures";
import { X } from "lucide-react-native";
import * as React from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

export type CachedPicturesGridProps = {
  pictures: CachedPicture[];
  /** Mode: "select" for upload modal, "edit" for settings management */
  mode?: "select" | "edit";
  /** Called when a picture is selected (select mode) */
  onSelect?: (picture: CachedPicture) => void;
  /** Called when delete button is pressed (edit mode) */
  onDelete?: (id: string) => void;
  /** Layout: "horizontal" for scrollable row, "grid" for full grid */
  layout?: "horizontal" | "grid";
  /** Size of each thumbnail */
  thumbnailSize?: number;
  /** Show empty state placeholder */
  showEmptyState?: boolean;
  /** Custom empty state message */
  emptyStateMessage?: string;
};

export function CachedPicturesGrid({
  pictures,
  mode = "select",
  onSelect,
  onDelete,
  layout = "horizontal",
  thumbnailSize = 72,
  showEmptyState = true,
  emptyStateMessage = "No recent pictures",
}: CachedPicturesGridProps) {
  if (pictures.length === 0) {
    if (!showEmptyState) return null;
    return (
      <View className="py-4 items-center justify-center">
        <Text className="text-sm text-muted-foreground">{emptyStateMessage}</Text>
      </View>
    );
  }

  const renderPicture = (picture: CachedPicture) => (
    <Pressable
      key={picture.id}
      onPress={() => {
        if (mode === "select") {
          onSelect?.(picture);
        }
      }}
      className="relative active:opacity-70"
    >
      <Image
        source={{ uri: picture.localUri }}
        style={{
          width: thumbnailSize,
          height: thumbnailSize,
          borderRadius: 8,
        }}
        resizeMode="cover"
      />
      {mode === "edit" && (
        <Pressable
          onPress={() => onDelete?.(picture.id)}
          className="absolute -top-2 -right-2 bg-destructive rounded-full p-1"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Icon as={X} size={12} className="text-white" />
        </Pressable>
      )}
    </Pressable>
  );

  if (layout === "horizontal") {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
      >
        {pictures.map(renderPicture)}
      </ScrollView>
    );
  }

  // Grid layout
  return (
    <View className="flex-row flex-wrap gap-2 px-4">
      {pictures.map(renderPicture)}
    </View>
  );
}
