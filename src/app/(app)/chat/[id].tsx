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
import { useUploadImage } from "@/hooks/use-upload-image";
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
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    View,
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChatState = "empty" | "quick-replies" | "messages";

export default function ChatDetail() {
  const currentUser = useQuery(api.users.currentUser);
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
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
  const sendAlbumMessage = useMutation(api.messages.sendAlbumMessage);
  const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead);
  const openViewOncePhoto = useMutation(api.messages.openViewOncePhoto);
  const stopAlbumSharing = useMutation(api.messages.stopAlbumSharing);

  // Image upload hook
  const { uploadImage, uploadImages, isUploading } = useUploadImage();

  // View-once photo viewer state
  const [viewOncePhotoState, setViewOncePhotoState] = useState<{
    isOpen: boolean;
    imageUrl: string | null;
    isLoading: boolean;
    messageId: Id<"messages"> | null;
  }>({ isOpen: false, imageUrl: null, isLoading: false, messageId: null });

  // Album viewer state
  const [albumViewerState, setAlbumViewerState] = useState<{
    isOpen: boolean;
    isLoading: boolean;
    photos: Array<{ uri: string }>;
    albumTitle: string;
    messageId: Id<"messages"> | null;
  }>({ isOpen: false, isLoading: false, photos: [], albumTitle: "", messageId: null });

  // Fetch album photos for viewer (only when viewing an album)
  const albumPhotosData = useQuery(
    api.messages.getAlbumPhotosForMessage,
    albumViewerState.messageId ? { messageId: albumViewerState.messageId } : "skip"
  );

  // Update album viewer when photos are loaded
  useEffect(() => {
    if (albumPhotosData && albumViewerState.isLoading) {
      if (albumPhotosData.locked) {
        // Album is locked/expired
        setAlbumViewerState({
          isOpen: false,
          isLoading: false,
          photos: [],
          albumTitle: "",
          messageId: null,
        });
        setError("This album has expired");
      } else {
        // Album is accessible
        setAlbumViewerState((prev) => ({
          ...prev,
          isLoading: false,
          photos: albumPhotosData.photos.map((p) => ({ uri: p.photoUrl })),
          albumTitle: albumPhotosData.albumTitle || "Album",
        }));
      }
    }
  }, [albumPhotosData, albumViewerState.isLoading]);

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
      // Album fields
      albumId: msg.albumId,
      albumExpiresAt: msg.albumExpiresAt,
      albumTitle: msg.albumTitle,
      albumCoverUrl: msg.albumCoverUrl,
      albumPhotoCount: msg.albumPhotoCount,
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
      // Upload images first if there are any attached
      let uploadedImageUrls: string[] | undefined;
      if (attachedImageUris.length > 0) {
        uploadedImageUrls = await uploadImages(attachedImageUris);
      }

      await sendMessage({
        otherUserId,
        text: message,
        imageUrls: uploadedImageUrls,
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
      // Upload image first
      const uploadedImageUrl = await uploadImage(imageUri);

      await sendMessage({
        otherUserId,
        text: "",
        imageUrls: [uploadedImageUrl],
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

  const handleAlbumSelected = async (album: AppAlbum, durationMs: number) => {
    if (!otherUserId) return;

    setError(null);
    try {
      await sendAlbumMessage({
        otherUserId,
        albumId: album._id,
        durationMs,
      });
    } catch (error) {
      setError(getConvexErrorMessage(error));
      console.error("Error sending album:", error);
    }
  };

  const handleAlbumMessagePress = (messageId: Id<"messages">) => {
    setAlbumViewerState({
      isOpen: true,
      isLoading: true,
      photos: [],
      albumTitle: "",
      messageId,
    });
  };

  const handleCloseAlbumViewer = () => {
    setAlbumViewerState({
      isOpen: false,
      isLoading: false,
      photos: [],
      albumTitle: "",
      messageId: null,
    });
  };

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

  const handleStopSharing = async (messageId: Id<"messages">) => {
    setError(null);
    try {
      await stopAlbumSharing({ messageId });
    } catch (error) {
      setError(getConvexErrorMessage(error));
      console.error("Error stopping album sharing:", error);
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
                  // Album props
                  albumId={msg.albumId}
                  albumExpiresAt={msg.albumExpiresAt}
                  albumTitle={msg.albumTitle}
                  albumCoverUrl={msg.albumCoverUrl}
                  albumPhotoCount={msg.albumPhotoCount}
                  onAlbumPress={() => handleAlbumMessagePress(msg.id)}
                  onStopSharing={
                    msg.isOutgoing && msg.albumId
                      ? () => handleStopSharing(msg.id)
                      : undefined
                  }
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
            isLoading={isUploading}
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
        cacheOnSelect
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

      {/* Album Carousel Viewer */}
      {albumViewerState.isLoading ? (
        <View className="absolute inset-0 bg-black items-center justify-center z-50">
          <ActivityIndicator size="large" color="#e56400" />
          <Text className="text-white mt-4">Loading album...</Text>
        </View>
      ) : albumViewerState.isOpen && albumViewerState.photos.length > 0 ? (
        <ImageViewing
          images={albumViewerState.photos}
          imageIndex={0}
          visible={albumViewerState.isOpen}
          onRequestClose={handleCloseAlbumViewer}
          HeaderComponent={({ imageIndex }) => (
            <AlbumViewerHeader
              albumTitle={albumViewerState.albumTitle}
              currentIndex={imageIndex}
              totalCount={albumViewerState.photos.length}
              onClose={handleCloseAlbumViewer}
            />
          )}
          backgroundColor="#000000"
          swipeToCloseEnabled
          doubleTapToZoomEnabled
        />
      ) : null}
    </View>
  );
}

type AlbumViewerHeaderProps = {
  albumTitle: string;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
};

function AlbumViewerHeader({
  albumTitle,
  currentIndex,
  totalCount,
  onClose,
}: AlbumViewerHeaderProps) {
  return (
    <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 pt-safe pb-3 bg-black/50">
      <Pressable
        onPress={onClose}
        className="size-10 items-center justify-center rounded-full"
        hitSlop={8}
      >
        <Icon as={ArrowLeft} size={24} className="text-white" />
      </Pressable>
      <View className="flex-1 items-center">
        <Text className="text-white text-base font-medium" numberOfLines={1}>
          {albumTitle}
        </Text>
        <Text className="text-white/70 text-xs">
          {currentIndex + 1} of {totalCount}
        </Text>
      </View>
      <View className="size-10" />
    </View>
  );
}
