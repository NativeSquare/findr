import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { PresenceState } from "@convex-dev/presence/react-native";
import { Doc } from "@convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

interface NearestUsersGridItemProps {
  userItem: Doc<"users"> & {
    distance: number;
  };
  presenceState: PresenceState[] | undefined;
}

export function NearestUsersGridItem({
  userItem,
  presenceState,
}: NearestUsersGridItemProps) {
  const userPresenceState = (presenceState || []).find(
    (state) => state.userId === userItem._id
  );
  const distance = (userItem.distance / 1000).toFixed(1);
  // If user has hidden their online status, always show as offline (gray)
  const isOnline =
    userItem.privacy?.hideOnlineStatus === true
      ? false
      : (userPresenceState?.online ?? false);
  return (
    <View className="relative aspect-square">
      <Avatar
        alt="User's Avatar"
        className="size-full items-center justify-center rounded-xl border border-border/60 bg-secondary/60"
      >
        <AvatarImage source={{ uri: userItem?.image }} />
        <AvatarFallback className="bg-secondary/60 rounded-xl">
          <Ionicons name="person" size={48} className="text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
        locations={[0, 0.5, 1]}
        className="absolute bottom-0 left-0 right-0 h-24 rounded-b-xl"
      />
      <View className="absolute bottom-3 left-3 right-3 flex-col">
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
            {userItem?.name ?? "Unknown"}
          </Text>
        </View>
        <Text className="text-xs font-normal text-white">
          {distance} km away
        </Text>
      </View>
    </View>
  );
}
