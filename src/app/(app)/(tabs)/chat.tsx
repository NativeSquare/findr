import { AlbumListItem } from "@/components/app/chat/album-list-item";
import { ChatListItem } from "@/components/app/chat/chat-list-item";
import { CreateAlbumBottomSheet } from "@/components/app/chat/create-album-bottom-sheet";
import { DeleteAlbumBottomSheet } from "@/components/app/chat/delete-album-bottom-sheet";
import { SearchInput } from "@/components/custom/search-input";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatChatListTimestamp } from "@/utils/formatChatTimestamp";
import { getConvexErrorMessage } from "@/utils/getConvexErrorMessage";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChatTabType = "Chats" | "Album";

export default function Chat() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ChatTabType>("Chats");
  const [searchQuery, setSearchQuery] = useState("");
  const createAlbumSheetRef = useRef<GorhomBottomSheetModal>(null);
  const deleteAlbumSheetRef = useRef<GorhomBottomSheetModal>(null);
  const [albumToDelete, setAlbumToDelete] = useState<{
    id: Id<"albums">;
    title: string;
    photoCount: number;
  } | null>(null);

  // Fetch conversations from backend
  const conversations = useQuery(api.conversations.getConversations);

  // Fetch albums from backend
  const albums = useQuery(api.albums.getAlbums);

  // Mutations
  const deleteAlbum = useMutation(api.albums.deleteAlbum);

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

  const filteredAlbums = useMemo(
    () =>
      albums
        ? albums.filter((album) =>
            album.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [],
    [albums, searchQuery]
  );

  const handleCreateAlbum = () => {
    createAlbumSheetRef.current?.present();
  };

  const handleAlbumCreated = () => {
    // Albums will automatically refresh via useQuery
  };

  const handleDeleteAlbum = (album: {
    id: Id<"albums">;
    title: string;
    photoCount: number;
  }) => {
    setAlbumToDelete(album);
  };

  // Present the delete sheet when albumToDelete is set
  useEffect(() => {
    if (albumToDelete) {
      // Use requestAnimationFrame to ensure the state update and component render happens first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          deleteAlbumSheetRef.current?.present();
        });
      });
    }
  }, [albumToDelete]);

  const handleConfirmDelete = async () => {
    if (!albumToDelete) return;

    try {
      await deleteAlbum({ albumId: albumToDelete.id });
      setAlbumToDelete(null);
    } catch (error) {
      console.error("Failed to delete album:", getConvexErrorMessage(error));
    }
  };

  const handleCancelDelete = () => {
    setAlbumToDelete(null);
  };

  return (
    <View className="flex-1">
      <View className="px-5 pt-4" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-xl font-medium leading-[30px] text-white">
            {activeTab === "Chats" ? "Chats" : "Albums"}
          </Text>
          {activeTab === "Album" && (
            <Pressable
              onPress={handleCreateAlbum}
              className="h-6 w-6 items-center justify-center"
            >
              <Icon as={Plus} size={24} className="text-white" />
            </Pressable>
          )}
        </View>

        <View className="mb-5">
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={activeTab === "Chats" ? "Search Chat" : "Search Album"}
          />
        </View>

        <View className="flex-row mb-5 gap-2">
          <Pressable
            onPress={() => {
              setActiveTab("Chats");
              setSearchQuery("");
            }}
            className={`h-[35px] px-3 py-1.5 rounded-[18px] ${
              activeTab === "Chats"
                ? "bg-primary"
                : "bg-[#131316] border border-[#1a1a1e]"
            }`}
          >
            <Text
              className={`text-sm font-medium leading-5 ${
                activeTab === "Chats" ? "text-black" : "text-[#d1d1d6]"
              }`}
            >
              Chats
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setActiveTab("Album");
              setSearchQuery("");
            }}
            className={`h-[35px] px-3 py-1.5 rounded-[18px] ${
              activeTab === "Album"
                ? "bg-[#e56400]"
                : "bg-[#131316] border border-[#1a1a1e]"
            }`}
          >
            <Text
              className={`text-sm font-medium leading-5 ${
                activeTab === "Album" ? "text-black" : "text-[#d1d1d6]"
              }`}
            >
              Album
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "Chats" ? (
          <View className="gap-4">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  id={chat.id}
                  name={chat.name}
                  avatarUri={chat.avatarUri}
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
        ) : (
          <View className="gap-4">
            {albums === undefined ? (
              <View className="flex-1 items-center justify-center py-10">
                <Text className="text-[#70707b] text-sm">Loading...</Text>
              </View>
            ) : filteredAlbums.length > 0 ? (
              <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                {filteredAlbums.map((album) => (
                  <View key={album._id} style={{ width: "47%" }}>
                    <AlbumListItem
                      id={album._id}
                      title={album.title}
                      photoCount={album.photoCount}
                      coverPhotoUrl={album.coverPhotoUrl}
                      thumbnailUrls={album.thumbnailUrls}
                      onPress={() => router.push(`/album/${album._id}` as any)}
                      onDelete={() =>
                        handleDeleteAlbum({
                          id: album._id,
                          title: album.title,
                          photoCount: album.photoCount,
                        })
                      }
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View className="flex-1 items-center justify-center py-20">
                <View className="h-[52px] w-[52px] items-center justify-center mb-3">
                  <Icon
                    as={Plus}
                    size={52}
                    className="text-[#d1d1d6] opacity-50"
                  />
                </View>
                <Text className="text-sm leading-5 text-[#d1d1d6]">
                  {searchQuery ? "No albums found" : "No Album yet"}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <CreateAlbumBottomSheet
        bottomSheetModalRef={createAlbumSheetRef}
        onAlbumCreated={handleAlbumCreated}
      />

      <DeleteAlbumBottomSheet
        bottomSheetModalRef={deleteAlbumSheetRef}
        albumTitle={albumToDelete?.title || ""}
        photoCount={albumToDelete?.photoCount || 0}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
}
