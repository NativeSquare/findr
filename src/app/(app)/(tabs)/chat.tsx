import { ChatListItem } from "@/components/app/chat/chat-list-item";
import { SearchInput } from "@/components/custom/search-input";
import { Text } from "@/components/ui/text";
import { formatChatListTimestamp } from "@/utils/formatChatTimestamp";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Chat() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch conversations from backend
  const conversations = useQuery(api.conversations.getConversations);

  // Transform conversations data for the UI
  const chats = useMemo(() => {
    if (!conversations) return [];

    return conversations.map((conv) => ({
      id: conv.otherUser._id,
      name: conv.otherUser.name || "Unknown",
      avatarUri: conv.otherUser.image,
      lastMessage: conv.lastMessage || undefined,
      timestamp: conv.lastMessageTime
        ? formatChatListTimestamp(conv.lastMessageTime)
        : undefined,
      unreadCount: conv.unreadCount || 0,
    }));
  }, [conversations]);

  const filteredChats = useMemo(
    () =>
      chats.filter(
        (chat) =>
          chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [chats, searchQuery]
  );

  return (
    <View className="flex-1">
      <View className="px-5 pt-4" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-xl font-medium leading-[30px] text-white">
            Chats
          </Text>
        </View>

        <View className="mb-5">
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Chat"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                id={chat.id}
                name={chat.name}
                avatarUri={chat.avatarUri || undefined}
                lastMessage={chat.lastMessage}
                timestamp={chat.timestamp}
                unreadCount={chat.unreadCount}
                onPress={() => router.push(`/chat/${chat.id}`)}
              />
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-10">
              <Text className="text-[#70707b] text-sm">
                {searchQuery ? "No chats found" : "No conversations yet"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
