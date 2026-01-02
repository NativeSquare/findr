import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Pressable, View } from "react-native";

export type ChatListItemProps = {
  id: string;
  name: string;
  avatarUri?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  onPress?: () => void;
};

export function ChatListItem({
  name,
  avatarUri,
  lastMessage,
  timestamp,
  unreadCount = 0,
  onPress,
}: ChatListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-3 py-2 items-center active:opacity-70"
    >
      <Avatar className="size-[52px] shrink-0" alt={name}>
        {avatarUri ? (
          <AvatarImage source={{ uri: avatarUri }} />
        ) : (
          <AvatarFallback>
            <Text className="text-white">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </Text>
          </AvatarFallback>
        )}
      </Avatar>
      <View className="flex-1 flex-col justify-center min-w-0">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="text-base font-medium leading-6 text-white flex-1"
            numberOfLines={1}
          >
            {name}
          </Text>
          <View className="flex-row items-center gap-2 shrink-0 ml-2">
            {timestamp && (
              <Text className="text-xs leading-[18px] text-[#70707b]">
                {timestamp}
              </Text>
            )}
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="min-w-[20px] h-5 px-1.5 rounded-full items-center justify-center"
              >
                <Text className="text-[10px] font-semibold text-white leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </Badge>
            )}
          </View>
        </View>
        {lastMessage ? (
          <Text
            className={`text-sm leading-5 ${
              unreadCount > 0 ? "text-white font-medium" : "text-[#70707b]"
            }`}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
        ) : (
          <Text className="text-sm leading-5 text-[#70707b]" numberOfLines={1}>
            No messages yet
          </Text>
        )}
      </View>
    </Pressable>
  );
}
