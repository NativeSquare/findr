import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { CachedPicture } from "@/hooks/use-cached-pictures";
import { Check, X } from "lucide-react-native";
import * as React from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

export type CachedPicturesGridProps = {
  pictures: CachedPicture[];
  /** Mode: "select" for upload modal, "edit" for settings management */
  mode?: "select" | "edit";
  /** Called when a picture is selected (select mode, single selection) */
  onSelect?: (picture: CachedPicture) => void;
  /** Called when multiple pictures are selected (select mode, multi-selection) */
  onMultiSelect?: (pictures: CachedPicture[]) => void;
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
  /** Enable multi-select on long press (default: true when onMultiSelect is provided) */
  allowMultiSelect?: boolean;
};

export function CachedPicturesGrid({
  pictures,
  mode = "select",
  onSelect,
  onMultiSelect,
  onDelete,
  layout = "horizontal",
  thumbnailSize = 72,
  showEmptyState = true,
  emptyStateMessage = "No recent pictures",
  allowMultiSelect,
}: CachedPicturesGridProps) {
  const [isMultiSelectMode, setIsMultiSelectMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const canMultiSelect = allowMultiSelect ?? !!onMultiSelect;

  const handleLongPress = (picture: CachedPicture) => {
    if (mode !== "select" || !canMultiSelect) return;
    
    setIsMultiSelectMode(true);
    setSelectedIds(new Set([picture.id]));
  };

  const handlePress = (picture: CachedPicture) => {
    if (mode !== "select") return;

    if (isMultiSelectMode) {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(picture.id)) {
          newSet.delete(picture.id);
        } else {
          newSet.add(picture.id);
        }
        return newSet;
      });
    } else {
      onSelect?.(picture);
    }
  };

  const handleDone = () => {
    if (selectedIds.size > 0) {
      const selectedPictures = pictures.filter((p) => selectedIds.has(p.id));
      onMultiSelect?.(selectedPictures);
    }
    setIsMultiSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleCancel = () => {
    setIsMultiSelectMode(false);
    setSelectedIds(new Set());
  };

  if (pictures.length === 0) {
    if (!showEmptyState) return null;
    return (
      <View className="items-center justify-center py-4">
        <Text className="text-sm text-muted-foreground">{emptyStateMessage}</Text>
      </View>
    );
  }

  const renderPicture = (picture: CachedPicture) => {
    const isSelected = selectedIds.has(picture.id);

    return (
      <Pressable
        key={picture.id}
        onPress={() => handlePress(picture)}
        onLongPress={() => handleLongPress(picture)}
        delayLongPress={300}
        className="relative active:opacity-70"
      >
        <Image
          source={{ uri: picture.localUri }}
          style={{
            width: thumbnailSize,
            height: thumbnailSize,
            borderRadius: 8,
            opacity: isMultiSelectMode && !isSelected ? 0.5 : 1,
          }}
          resizeMode="cover"
        />
        {isMultiSelectMode && isSelected && (
          <View
            className="absolute inset-0 items-center justify-center rounded-lg border-2 border-primary bg-primary/20"
            style={{ borderRadius: 8 }}
          >
            <View className="rounded-full bg-primary p-1">
              <Icon as={Check} size={14} className="text-primary-foreground" />
            </View>
          </View>
        )}
        {mode === "edit" && (
          <Pressable
            onPress={() => onDelete?.(picture.id)}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1"
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Icon as={X} size={12} className="text-white" />
          </Pressable>
        )}
      </Pressable>
    );
  };

  const renderMultiSelectHeader = () => {
    if (!isMultiSelectMode) return null;

    return (
      <View className="mb-2 flex-row items-center justify-between px-4">
        <Button variant="ghost" size="sm" onPress={handleCancel}>
          <Text className="text-muted-foreground">Cancel</Text>
        </Button>
        <Text className="text-sm text-muted-foreground">
          {selectedIds.size} selected
        </Text>
        <Button
          variant="ghost"
          size="sm"
          onPress={handleDone}
          disabled={selectedIds.size === 0}
        >
          <Text className={selectedIds.size === 0 ? "text-muted-foreground" : "text-primary"}>
            Done
          </Text>
        </Button>
      </View>
    );
  };

  if (layout === "horizontal") {
    return (
      <View>
        {renderMultiSelectHeader()}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
        >
          {pictures.map(renderPicture)}
        </ScrollView>
      </View>
    );
  }

  // Grid layout
  return (
    <View>
      {renderMultiSelectHeader()}
      <View className="flex-row flex-wrap gap-2 px-4">
        {pictures.map(renderPicture)}
      </View>
    </View>
  );
}
