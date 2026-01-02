import { Checkbox } from "@/components/ui/checkbox";
import type { Id } from "@convex/_generated/dataModel";
import { Image, Pressable, View } from "react-native";

export type AlbumPhotoItemProps = {
  photoId: Id<"albumPhotos">;
  photoUrl: string;
  isSelected: boolean;
  isEditMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onSelect: (photoId: Id<"albumPhotos">) => void;
};

export function AlbumPhotoItem({
  photoId,
  photoUrl,
  isSelected,
  isEditMode,
  onPress,
  onLongPress,
  onSelect,
}: AlbumPhotoItemProps) {
  const handlePress = () => {
    if (isEditMode) {
      onSelect(photoId);
    } else {
      onPress();
    }
  };

  return (
    <View className="flex-1 aspect-square relative">
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress}
        className="flex-1 rounded overflow-hidden"
        style={{ borderRadius: 4 }}
      >
        <Image
          source={{ uri: photoUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {isEditMode && isSelected && (
          <View className="absolute inset-0 bg-white opacity-50" />
        )}
      </Pressable>
      {isEditMode && (
        <View className="absolute bottom-1.5 right-1.5">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(photoId)}
            className="bg-[#131316] border border-[#1a1a1e] rounded-full size-4"
            checkedClassName="bg-[#e56400] border-[#e56400]"
            indicatorClassName="bg-[#e56400]"
            iconClassName="text-black"
          />
        </View>
      )}
    </View>
  );
}
