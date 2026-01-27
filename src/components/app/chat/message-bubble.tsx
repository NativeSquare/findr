import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { Id } from "@convex/_generated/dataModel";
import { Ban } from "lucide-react-native";
import { useState } from "react";
import { Dimensions, Image, Pressable, View } from "react-native";
import ImageViewing from "react-native-image-viewing";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";

export type MessageBubbleProps = {
  message: string;
  timestamp: string;
  isOutgoing: boolean;
  imageUrls?: string[];
  viewOnce?: boolean;
  viewOnceOpened?: boolean;
  onViewOncePress?: () => void;
  // Album message fields
  albumId?: Id<"albums">;
  albumExpiresAt?: number;
  albumTitle?: string;
  albumCoverUrl?: string;
  albumPhotoCount?: number;
  onAlbumPress?: () => void;
  onStopSharing?: () => void;
};

export function MessageBubble({
  message,
  timestamp,
  isOutgoing,
  imageUrls = [],
  viewOnce = false,
  viewOnceOpened = false,
  onViewOncePress,
  // Album props
  albumId,
  albumExpiresAt,
  albumTitle,
  albumCoverUrl,
  albumPhotoCount,
  onAlbumPress,
  onStopSharing,
}: MessageBubbleProps) {
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);

  const hasImages = imageUrls.length > 0;
  const hasText = !!message && message.trim().length > 0;

  // Album message handling
  const isAlbumMessage = !!albumId;
  const isAlbumExpired = isAlbumMessage && albumExpiresAt ? Date.now() > albumExpiresAt : false;

  // For view-once messages that haven't been opened (from other user), show the "(1) Photo" placeholder
  const showViewOncePlaceholder = viewOnce && !viewOnceOpened && !isOutgoing;
  // For view-once messages that have been opened (incoming), show "Photo" with opened icon
  const showViewOnceOpenedMessage = viewOnce && viewOnceOpened && !isOutgoing;
  // For outgoing view-once messages that haven't been opened yet, show "(1) Photo"
  const showOutgoingViewOnceIndicator = viewOnce && !viewOnceOpened && isOutgoing;
  // For outgoing view-once messages that have been opened, show "Photo" with opened icon
  const showOutgoingViewOnceOpened = viewOnce && viewOnceOpened && isOutgoing;

  const screenWidth = Dimensions.get("window").width;
  const maxImageWidth = screenWidth * 0.6; // 60% of screen width for images
  const gridImageSize = (maxImageWidth - 4) / 2; // Size for 2-column grid with gap

  const handleImagePress = (index: number) => {
    setViewerImageIndex(index);
    setIsViewerVisible(true);
  };

  // Render view-once photo placeholder (both for incoming unopened and outgoing)
  if (showViewOncePlaceholder || showOutgoingViewOnceIndicator || showViewOnceOpenedMessage || showOutgoingViewOnceOpened) {
    const isOpened = showViewOnceOpenedMessage || showOutgoingViewOnceOpened;
    const showOneIcon = !isOpened;
    const isClickable = showViewOncePlaceholder && onViewOncePress;

    return (
      <View
        className={`flex-col ${isOutgoing ? "items-end" : "items-start"} mb-3`}
      >
        <Pressable
          onPress={isClickable ? onViewOncePress : undefined}
          disabled={!isClickable}
        >
          <View
            className={`flex-row gap-2 items-center px-4 py-2.5 max-w-[80%] ${
              isOutgoing
                ? "bg-[#f7cfb0] rounded-full"
                : "bg-[#26272b] rounded-full"
            }`}
          >
            <View className="flex-row items-center gap-1.5">
              {showOneIcon && <ViewOnceIcon isOutgoing={isOutgoing} />}
              {isOpened && <OpenedIcon isOutgoing={isOutgoing} />}
              <Text
                className={`text-sm leading-5 ${
                  isOutgoing ? "text-[#26272b]" : "text-[#d1d1d6]"
                }`}
              >
                Photo
              </Text>
            </View>
            <Text
              className={`text-xs leading-[18px] shrink-0 ${
                isOutgoing ? "text-[#51525c]" : "text-[#70707b]"
              }`}
            >
              {timestamp}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  }

  // Render album message
  if (isAlbumMessage) {
    const screenWidth = Dimensions.get("window").width;
    const albumWidth = screenWidth * 0.6;

    // Show context menu only for outgoing (owned) albums that haven't expired
    const canStopSharing = isOutgoing && !isAlbumExpired && onStopSharing;

    const albumContent = (
      <Pressable
        onPress={!isAlbumExpired ? onAlbumPress : undefined}
        disabled={isAlbumExpired}
      >
        <View
          className={`rounded-xl overflow-hidden ${
            isOutgoing
              ? "rounded-bl-xl rounded-tl-xl rounded-tr-xl"
              : "rounded-br-xl rounded-tl-xl rounded-tr-xl"
          }`}
          style={{ width: albumWidth }}
        >
          {/* Cover photo with overlay */}
          <View className="relative">
            <View
              style={{ width: albumWidth, height: 160 }}
              className="bg-[#1a1a1e]"
            >
              {albumCoverUrl ? (
                <Image
                  source={{ uri: albumCoverUrl }}
                  style={{ width: albumWidth, height: 160 }}
                  resizeMode="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-[#70707b] text-sm">No cover</Text>
                </View>
              )}
            </View>

            {/* Locked overlay for expired albums */}
            {isAlbumExpired && (
              <View className="absolute inset-0 bg-black items-center justify-center">
                <LockIcon />
                <Text className="text-white text-sm font-medium mt-2">
                  Album expired
                </Text>
              </View>
            )}

            {/* Album info overlay at bottom */}
            <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center gap-2">
                  <AlbumIcon />
                  <Text
                    className="text-white text-sm font-medium flex-1"
                    numberOfLines={1}
                  >
                    {albumTitle || "Album"}
                  </Text>
                </View>
                <Text className="text-white/70 text-xs">
                  {albumPhotoCount} photos
                </Text>
              </View>
            </View>
          </View>

          {/* Timestamp */}
          <View
            className={`px-3 py-2 ${
              isOutgoing ? "bg-[#f7cfb0]" : "bg-[#26272b]"
            }`}
          >
            <Text
              className={`text-xs leading-[18px] ${
                isOutgoing ? "text-[#51525c]" : "text-[#70707b]"
              }`}
            >
              {timestamp}
            </Text>
          </View>
        </View>
      </Pressable>
    );

    if (canStopSharing) {
      return (
        <View
          className={`flex-col ${isOutgoing ? "items-end" : "items-start"} mb-3`}
        >
          <ContextMenu>
            <ContextMenuTrigger asChild>
              {albumContent}
            </ContextMenuTrigger>
            <ContextMenuContent
              className="bg-[#131316] border border-[#1a1a1e] rounded-lg shadow-lg min-w-[200px]"
              align="end"
            >
              <ContextMenuItem
                onPress={onStopSharing}
                variant="destructive"
                className="bg-[#131316] px-3.5 py-3 gap-2"
              >
                <Icon as={Ban} size={16} className="text-[#f04438]" />
                <Text className="text-sm leading-5 text-[#f04438]">
                  Stop Sharing
                </Text>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </View>
      );
    }

    return (
      <View
        className={`flex-col ${isOutgoing ? "items-end" : "items-start"} mb-3`}
      >
        {albumContent}
      </View>
    );
  }

  // If there's no image, use the original layout
  if (!hasImages) {
    return (
      <View
        className={`flex-col ${isOutgoing ? "items-end" : "items-start"} mb-3`}
      >
        <View
          className={`flex-row gap-4 items-center px-4 py-2.5 max-w-[80%] ${
            isOutgoing
              ? "bg-[#f7cfb0] rounded-full"
              : "bg-[#26272b] rounded-full"
          }`}
        >
          <View className="flex-1">
            <Text
              className={`text-sm leading-5 ${
                isOutgoing ? "text-[#26272b]" : "text-[#d1d1d6]"
              }`}
            >
              {message}
            </Text>
          </View>
          <Text
            className={`text-xs leading-[18px] shrink-0 ${
              isOutgoing ? "text-[#51525c]" : "text-[#70707b]"
            }`}
          >
            {timestamp}
          </Text>
        </View>
      </View>
    );
  }

  // Render images based on count
  const renderImages = () => {
    if (imageUrls.length === 1) {
      // Single image - full width
      return (
        <Pressable onPress={() => handleImagePress(0)}>
          <View
            style={{
              width: maxImageWidth,
              height: 200,
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: "#1a1a1e",
            }}
          >
            <Image
              source={{ uri: imageUrls[0] }}
              style={{ width: maxImageWidth, height: 200 }}
              resizeMode="cover"
              onError={(error) => {
                console.error("Image load error:", error);
              }}
            />
          </View>
        </Pressable>
      );
    }

    if (imageUrls.length === 2) {
      // Two images side by side
      return (
        <View style={{ flexDirection: "row", gap: 4, width: maxImageWidth }}>
          {imageUrls.map((url, index) => (
            <Pressable key={`${url}-${index}`} onPress={() => handleImagePress(index)}>
              <View
                style={{
                  width: gridImageSize,
                  height: 150,
                  borderRadius: 8,
                  overflow: "hidden",
                  backgroundColor: "#1a1a1e",
                }}
              >
                <Image
                  source={{ uri: url }}
                  style={{ width: gridImageSize, height: 150 }}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error("Image load error:", error);
                  }}
                />
              </View>
            </Pressable>
          ))}
        </View>
      );
    }

    // 3+ images - grid layout (2 columns)
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 4,
          width: maxImageWidth,
        }}
      >
        {imageUrls.map((url, index) => (
          <Pressable key={`${url}-${index}`} onPress={() => handleImagePress(index)}>
            <View
              style={{
                width: gridImageSize,
                height: gridImageSize,
                borderRadius: 8,
                overflow: "hidden",
                backgroundColor: "#1a1a1e",
              }}
            >
              <Image
                source={{ uri: url }}
                style={{ width: gridImageSize, height: gridImageSize }}
                resizeMode="cover"
                onError={(error) => {
                  console.error("Image load error:", error);
                }}
              />
            </View>
          </Pressable>
        ))}
      </View>
    );
  };

  // Convert imageUrls to the format expected by ImageViewing
  const viewerImages = imageUrls.map((uri) => ({ uri }));

  // If there are images, use the image layout
  return (
    <View
      className={`flex-col ${isOutgoing ? "items-end" : "items-start"} mb-3`}
    >
      <View
        className={`flex-col gap-2 rounded-3xl overflow-hidden max-w-[80%] ${
          isOutgoing ? "bg-[#f7cfb0]" : "bg-[#26272b]"
        } ${hasText ? "px-4 py-2.5" : "p-0"}`}
      >
        {renderImages()}
        {hasText && (
          <View className="flex-row gap-4 items-center">
            <View className="flex-1">
              <Text
                className={`text-sm leading-5 ${
                  isOutgoing ? "text-[#26272b]" : "text-[#d1d1d6]"
                }`}
              >
                {message}
              </Text>
            </View>
            <Text
              className={`text-xs leading-[18px] shrink-0 ${
                isOutgoing ? "text-[#51525c]" : "text-[#70707b]"
              }`}
            >
              {timestamp}
            </Text>
          </View>
        )}
        {!hasText && (
          <View className="px-3 pb-2">
            <Text
              className={`text-xs leading-[18px] ${
                isOutgoing ? "text-[#51525c]" : "text-[#70707b]"
              }`}
            >
              {timestamp}
            </Text>
          </View>
        )}
      </View>

      {/* Fullscreen Image Viewer */}
      <ImageViewing
        images={viewerImages}
        imageIndex={viewerImageIndex}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)}
        HeaderComponent={({ imageIndex }) => (
          <ImageViewerHeader
            currentIndex={imageIndex}
            totalCount={viewerImages.length}
            onClose={() => setIsViewerVisible(false)}
          />
        )}
        backgroundColor="#000000"
        swipeToCloseEnabled
        doubleTapToZoomEnabled
      />
    </View>
  );
}

type ImageViewerHeaderProps = {
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
};

function ImageViewerHeader({ currentIndex, totalCount, onClose }: ImageViewerHeaderProps) {
  return (
    <View
      className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 pt-safe pb-3 bg-black/50"
    >
      <Pressable
        onPress={onClose}
        className="size-10 items-center justify-center rounded-full"
        hitSlop={8}
      >
        <View className="size-6">
          <ArrowLeftIcon />
        </View>
      </Pressable>
      {totalCount > 1 && (
        <Text className="text-white text-sm font-medium">
          {currentIndex + 1} / {totalCount}
        </Text>
      )}
      <View className="size-10" />
    </View>
  );
}

function ArrowLeftIcon() {
  return (
    <View style={{ width: 24, height: 24, justifyContent: "center", alignItems: "center" }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderLeftWidth: 2,
          borderBottomWidth: 2,
          borderColor: "white",
          transform: [{ rotate: "45deg" }],
          marginLeft: 4,
        }}
      />
    </View>
  );
}

// View-once icon - circle with "1" inside
function ViewOnceIcon({ isOutgoing }: { isOutgoing: boolean }) {
  const strokeColor = isOutgoing ? "#26272b" : "#d1d1d6";
  const textColor = isOutgoing ? "#26272b" : "#d1d1d6";

  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Circle
        cx={9}
        cy={9}
        r={7}
        stroke={strokeColor}
        strokeWidth={1.5}
        fill="none"
      />
      <SvgText
        x={9}
        y={13}
        textAnchor="middle"
        fontSize={11}
        fontWeight="600"
        fill={textColor}
      >
        1
      </SvgText>
    </Svg>
  );
}

// Opened icon - indicates the photo has been viewed
function OpenedIcon({ isOutgoing }: { isOutgoing: boolean }) {
  const strokeColor = isOutgoing ? "#51525c" : "#70707b";

  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Circle
        cx={9}
        cy={9}
        r={7}
        stroke={strokeColor}
        strokeWidth={1.5}
        fill="none"
        strokeDasharray="3 2"
      />
    </Svg>
  );
}

// Lock icon for expired albums
function LockIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Album icon for album messages
function AlbumIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 15L16 10L5 21"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
