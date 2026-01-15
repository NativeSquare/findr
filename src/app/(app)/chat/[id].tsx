import { MessageBubble } from "@/components/app/chat/message-bubble";
import { MessageInput } from "@/components/app/chat/message-input";
import { QuickReplies } from "@/components/app/chat/quick-replies";
import {
  SelectAlbumModal,
  type AppAlbum,
} from "@/components/app/chat/select-album-modal";
import { ViewOncePhotoViewer } from "@/components/app/chat/view-once-photo-viewer";
import { UploadMediaBottomSheetModal } from "@/components/shared/upload-media-bottom-sheet-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatChatTimestamp } from "@/utils/formatChatTimestamp";
import { getConvexErrorMessage } from "@/utils/getConvexErrorMessage";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import type { ImagePickerAsset } from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChatState = "empty" | "quick-replies" | "messages";

export default function ChatDetail() {
  const currentUser = useQuery(api.users.currentUser);
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<Id<"albums"> | null>(
    null
  );
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [attachedImageUris, setAttachedImageUris] = useState<string[]>([]);
  const uploadMediaBottomSheetRef = useRef<BottomSheetModal>(null);
  const selectAlbumModalRef = useRef<BottomSheetModal>(null);

  const otherUserId = id as Id<"users"> | undefined;

  // Fetch user data
  const user = useQuery(
    api.users.get,
    otherUserId ? { id: otherUserId } : "skip"
  );

  // Fetch conversation
  const conversation = useQuery(
    api.conversations.getConversation,
    otherUserId ? { otherUserId } : "skip"
  );

  // Fetch messages
  const messagesData = useQuery(
    api.messages.getMessagesByUserId,
    otherUserId ? { otherUserId } : "skip"
  );

  // Mutations
  const sendMessage = useMutation(api.messages.sendMessage);
  const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead);
  const openViewOncePhoto = useMutation(api.messages.openViewOncePhoto);

  // View-once photo viewer state
  const [viewOncePhotoState, setViewOncePhotoState] = useState<{
    isOpen: boolean;
    imageUrl: string | null;
    isLoading: boolean;
    messageId: Id<"messages"> | null;
  }>({ isOpen: false, imageUrl: null, isLoading: false, messageId: null });

  // Fetch selected album when an album is selected
  const selectedAlbum = useQuery(
    api.albums.getAlbum,
    selectedAlbumId ? { albumId: selectedAlbumId } : "skip"
  );

  // Convert storage ID to URL for user profile picture
  const userImageUrl = useQuery(
    api.storage.getImageUrl,
    user?.profilePictures?.[0] ? { storageId: user.profilePictures[0] } : "skip"
  );

  // Determine chat state based on messages
  const chatState: ChatState = useMemo(() => {
    if (!messagesData || messagesData.length === 0) {
      return "empty";
    }
    return "messages";
  }, [messagesData]);

  // Format messages for display
  const messages = useMemo(() => {
    if (!messagesData) return [];

    return messagesData.map((msg) => ({
      id: msg._id,
      text: msg.text,
      imageUrls: msg.imageUrls,
      timestamp: formatChatTimestamp(msg.timestamp),
      isOutgoing: msg.isOutgoing,
      viewOnce: msg.viewOnce,
      viewOnceOpened: msg.viewOnceOpened,
    }));
  }, [messagesData]);

  // Mark messages as read when viewing the conversation
  useEffect(() => {
    if (conversation?._id) {
      markMessagesAsRead({ conversationId: conversation._id }).catch(
        (error) => {
          console.error("Error marking messages as read:", error);
        }
      );
    }
  }, [conversation?._id, markMessagesAsRead]);

  // Use the other user's first sentences, or fallback to empty array
  const quickReplies = currentUser?.firstSentences ?? [];

  const handleSend = async () => {
    if ((!message.trim() && attachedImageUris.length === 0) || !otherUserId)
      return;

    setError(null);
    try {
      await sendMessage({
        otherUserId,
        text: message,
        imageUrls: attachedImageUris.length > 0 ? attachedImageUris : undefined,
      });
      setMessage("");
      setAttachedImageUris([]);
    } catch (error) {
      setError(getConvexErrorMessage(error));
      console.error("Error sending message:", error);
    }
  };

  const handleImagesSelected = (images: ImagePickerAsset[]) => {
    const newUris = images.map((img) => img.uri);
    setAttachedImageUris((prev) => [...prev, ...newUris]);
  };

  const handleCameraSend = async (imageUri: string, viewOnce?: boolean) => {
    if (!otherUserId) return;

    setError(null);
    try {
      await sendMessage({
        otherUserId,
        text: "",
        imageUrls: [imageUri],
        viewOnce: viewOnce ?? false,
      });
    } catch (error) {
      setError(getConvexErrorMessage(error));
      console.error("Error sending camera photo:", error);
    }
  };

  const handleViewOncePress = async (messageId: Id<"messages">) => {
    setViewOncePhotoState({
      isOpen: true,
      imageUrl: null,
      isLoading: true,
      messageId,
    });

    try {
      // Open the view-once photo - this marks it as opened and returns the image URL
      const result = await openViewOncePhoto({ messageId });
      if (result?.imageUrl) {
        setViewOncePhotoState({
          isOpen: true,
          imageUrl: result.imageUrl,
          isLoading: false,
          messageId,
        });
      } else {
        setViewOncePhotoState({
          isOpen: true,
          imageUrl: null,
          isLoading: false,
          messageId,
        });
      }
    } catch (error) {
      console.error("Error opening view-once photo:", error);
      setError(getConvexErrorMessage(error));
      setViewOncePhotoState({
        isOpen: false,
        imageUrl: null,
        isLoading: false,
        messageId: null,
      });
    }
  };

  const handleCloseViewOncePhoto = () => {
    setViewOncePhotoState({
      isOpen: false,
      imageUrl: null,
      isLoading: false,
      messageId: null,
    });
  };

  const handleRemoveImage = (index: number) => {
    setAttachedImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCameraPress = () => {
    Keyboard.dismiss();
    uploadMediaBottomSheetRef.current?.present();
  };

  const handleAlbumPress = () => {
    selectAlbumModalRef.current?.present();
  };

  const handleAlbumSelected = (album: AppAlbum) => {
    // Set the selected album ID to trigger the query
    setSelectedAlbumId(album._id);
  };

  // Send album photos when album is loaded
  useEffect(() => {
    if (!selectedAlbum || !otherUserId || selectedAlbum.photos.length === 0) {
      return;
    }

    const sendAlbumPhotos = async () => {
      setError(null);
      try {
        // Send all album photos as a single message with multiple images
        const photoUrls = selectedAlbum.photos.map((photo) => photo.photoUrl);
        await sendMessage({
          otherUserId: otherUserId!,
          text: "",
          imageUrls: photoUrls,
        });
        // Reset selected album ID after sending
        setSelectedAlbumId(null);
      } catch (error) {
        setError(getConvexErrorMessage(error));
        console.error("Error sending album:", error);
        setSelectedAlbumId(null);
      }
    };

    sendAlbumPhotos();
  }, [selectedAlbum, otherUserId, sendMessage]);

  const handleQuickReply = async (reply: string) => {
    if (!otherUserId) return;

    setError(null);
    try {
      await sendMessage({
        otherUserId,
        text: reply,
      });
    } catch (error) {
      setError(getConvexErrorMessage(error));
      console.error("Error sending quick reply:", error);
    }
  };

  // Show loading state
  if (!user) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  const userName = user.name || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View className="flex-1">
      {/* Header */}
      <View
        className="border-b border-[#26272b] px-5 pb-4 pt-0"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center gap-3 h-[44px]">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onPress={() => router.back()}
          >
            <Icon as={ArrowLeft} size={24} className="text-white" />
          </Button>
          <Pressable
            className="flex-row items-center gap-3 flex-1"
            onPress={() => router.push(`/user/${otherUserId}`)}
          >
            <Avatar className="size-10 shrink-0" alt={userName}>
              {userImageUrl ? (
                <AvatarImage source={{ uri: userImageUrl }} />
              ) : (
                <AvatarFallback>
                  <Text className="text-white">{userInitials}</Text>
                </AvatarFallback>
              )}
            </Avatar>
            <Text className="text-lg font-medium leading-7 text-white">
              {userName}
            </Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {chatState === "empty" && (
            <View className="flex-1 items-center justify-center px-5">
              <Avatar className="size-[100px] mb-1" alt={userName}>
                {userImageUrl ? (
                  <AvatarImage source={{ uri: userImageUrl }} />
                ) : (
                  <AvatarFallback>
                    <Text className="text-white text-2xl">{userInitials}</Text>
                  </AvatarFallback>
                )}
              </Avatar>
              <Text className="text-base font-medium leading-6 text-white">
                {userName}
              </Text>
            </View>
          )}

          {chatState === "messages" && messages.length > 0 && (
            <View className="px-5 pt-5">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg.text}
                  timestamp={msg.timestamp}
                  isOutgoing={msg.isOutgoing}
                  imageUrls={msg.imageUrls}
                  viewOnce={msg.viewOnce}
                  viewOnceOpened={msg.viewOnceOpened}
                  onViewOncePress={() => handleViewOncePress(msg.id)}
                />
              ))}
            </View>
          )}

          {error && (
            <View className="px-5 py-2">
              <Text className="text-red-500 text-sm">{error}</Text>
            </View>
          )}
        </ScrollView>

        {chatState === "empty" && (
          <QuickReplies
            replies={quickReplies}
            onReplySelect={handleQuickReply}
          />
        )}

        <View className={isInputFocused ? "" : "pb-safe"}>
          <MessageInput
            value={message}
            onChangeText={setMessage}
            onSend={handleSend}
            onCameraPress={handleCameraPress}
            autoFocus
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            attachedImageUris={attachedImageUris}
            onRemoveImage={handleRemoveImage}
          />
        </View>
      </KeyboardAvoidingView>

      <UploadMediaBottomSheetModal
        bottomSheetModalRef={uploadMediaBottomSheetRef}
        onImagesSelected={handleImagesSelected}
        onAlbumPress={handleAlbumPress}
        options={["camera", "gallery", "album"]}
        allowsMultipleSelection
        showCameraConfirmation
        onCameraSend={handleCameraSend}
        showViewOnceOption
      />

      <SelectAlbumModal
        bottomSheetModalRef={selectAlbumModalRef}
        onAlbumSelected={handleAlbumSelected}
      />

      <ViewOncePhotoViewer
        visible={viewOncePhotoState.isOpen}
        imageUrl={viewOncePhotoState.imageUrl}
        isLoading={viewOncePhotoState.isLoading}
        onClose={handleCloseViewOncePhoto}
      />
    </View>
  );
}
