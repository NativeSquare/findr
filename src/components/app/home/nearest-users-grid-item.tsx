import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { PresenceState } from "@convex-dev/presence/react-native";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { View } from "react-native";

interface NearestUsersGridItemProps {
  userId: Id<"users">;
  presenceState: PresenceState[] | undefined;
}

export function NearestUsersGridItem({
  userId,
  presenceState,
}: NearestUsersGridItemProps) {
  const user = useQuery(api.users.get, { id: userId });
  const userPresenceState = (presenceState || []).find(
    (state) => state.userId === userId
  );
  const isOnline = userPresenceState?.online ?? false;
  return (
    <View className="relative aspect-square">
      <Avatar
        alt="User's Avatar"
        className="size-28 items-center justify-center rounded-xl border border-border/60 bg-secondary/60"
      >
        <AvatarImage source={{ uri: user?.image }} />
        <AvatarFallback className="bg-secondary/60 rounded-xl">
          <Ionicons name="person" size={48} className="text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <View className="absolute bottom-2 left-2 right-2 flex-row items-center gap-2">
        <View
          className={
            userPresenceState?.online
              ? "size-2 shrink-0 rounded-full bg-green-500"
              : "size-2 shrink-0 rounded-full bg-gray-500"
          }
        />
        <Text
          className="flex-1 text-xs font-normal text-white"
          numberOfLines={1}
        >
          {user?.name ?? "Unknown"}
        </Text>
      </View>
    </View>
  );
}
