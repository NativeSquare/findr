import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Plus, X } from "lucide-react-native";
import { ActivityIndicator, Image, Pressable, View } from "react-native";

export type PhotoGridItemProps = {
  storageId: Id<"_storage"> | null | undefined;
  onPress: () => void;
  onRemove?: () => void;
  isLoading?: boolean;
};

export function PhotoGridItem({
  storageId,
  onPress,
  onRemove,
  isLoading = false,
}: PhotoGridItemProps) {
  const imageUrl = useQuery(
    api.storage.getImageUrl,
    storageId ? { storageId } : "skip"
  );
  return (
    <View className="relative flex-1">
      <Pressable
        onPress={onPress}
        disabled={isLoading}
        className={
          "aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-card/30"
        }
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="size-full"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center gap-1">
            <Icon as={Plus} size={20} className="text-muted-foreground" />
            <Text className="text-xs text-muted-foreground">Add Photo</Text>
          </View>
        )}
        {isLoading && (
          <View className="absolute inset-0 items-center justify-center bg-black/50 rounded-lg">
            <ActivityIndicator size="small" color="#ffffff" />
          </View>
        )}
      </Pressable>
      {imageUrl && onRemove && !isLoading && (
        <Pressable
          onPress={onRemove}
          className={
            "absolute -top-2 -right-2 size-7 items-center justify-center rounded-full bg-destructive"
          }
        >
          <Icon as={X} size={16} className="text-destructive-foreground" />
        </Pressable>
      )}
    </View>
  );
}
