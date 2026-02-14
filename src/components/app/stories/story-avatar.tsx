import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

export type StoryAvatarProps = {
  name: string;
  avatarUrl: string | null;
  /** Show the orange ring around the avatar (indicates active stories) */
  hasStoryRing?: boolean;
  /** Show the "+" icon overlay (for create story button) */
  showAddIcon?: boolean;
  onPress?: () => void;
  /** Separate handler for the "+" icon tap (takes priority over onPress for that area) */
  onAddPress?: () => void;
};

export function StoryAvatar({
  name,
  avatarUrl,
  hasStoryRing = false,
  showAddIcon = false,
  onPress,
  onAddPress,
}: StoryAvatarProps) {
  return (
    <Pressable onPress={onPress} className="items-center" style={{ width: 72 }}>
      <View
        className="items-center justify-center"
        style={{ width: 72, height: 72 }}
      >
        {/* Orange ring wrapper */}
        <View
          className="items-center justify-center rounded-full"
          style={
            hasStoryRing
              ? {
                  width: 72,
                  height: 72,
                  borderWidth: 2,
                  borderColor: "#E56400",
                }
              : {
                  width: 72,
                  height: 72,
                }
          }
        >
          <Avatar className="size-[60px]" alt={name}>
            {avatarUrl ? (
              <AvatarImage source={{ uri: avatarUrl }} />
            ) : (
              <AvatarFallback className="bg-secondary">
                <Ionicons name="person" size={28} color="#a1a1aa" />
              </AvatarFallback>
            )}
          </Avatar>
        </View>

        {/* Add icon overlay — its own pressable so it can be tapped independently */}
        {showAddIcon && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              (onAddPress ?? onPress)?.();
            }}
            hitSlop={6}
            className="absolute items-center justify-center rounded-full bg-primary"
            style={{
              width: 20,
              height: 20,
              bottom: 0,
              right: 6,
            }}
          >
            <Ionicons name="add" size={14} color="#fff" />
          </Pressable>
        )}
      </View>

      <Text
        className="text-center text-xs"
        numberOfLines={1}
        style={{ width: 60 }}
      >
        {name}
      </Text>
    </Pressable>
  );
}
