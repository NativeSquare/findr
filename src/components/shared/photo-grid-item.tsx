import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Plus, X } from "lucide-react-native";
import { Image, Pressable, View } from "react-native";

export type PhotoGridItemProps = {
  uri: string;
  onPress: () => void;
  onRemove?: () => void;
};

export function PhotoGridItem({ uri, onPress, onRemove }: PhotoGridItemProps) {
  return (
    <View className="relative flex-1">
      <Pressable
        onPress={onPress}
        className={
          "aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-card/30"
        }
      >
        {uri ? (
          <Image source={{ uri }} className="size-full" resizeMode="cover" />
        ) : (
          <View className="items-center gap-1">
            <Icon as={Plus} size={20} className="text-muted-foreground" />
            <Text className="text-xs text-muted-foreground">Add Photo</Text>
          </View>
        )}
      </Pressable>
      {uri && onRemove && (
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
