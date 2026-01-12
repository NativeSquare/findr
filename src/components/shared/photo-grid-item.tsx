import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Plus, X } from "lucide-react-native";
import { Image, Pressable, View } from "react-native";

export type PhotoGridItemProps = {
  storageId: Id<"_storage"> | null | undefined;
  onPress: () => void;
  onRemove?: () => void;
};

export function PhotoGridItem({
  storageId,
  onPress,
  onRemove,
}: PhotoGridItemProps) {
  const imageUrl = useQuery(
    api.storage.getImageUrl,
    storageId ? { storageId } : "skip"
  );
  return (
    <View className="relative flex-1">
      <Pressable
        onPress={onPress}
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
      </Pressable>
      {imageUrl && onRemove && (
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
