import { Text } from "@/components/ui/text";
import { useState } from "react";
import { Dimensions, Image, Pressable, View } from "react-native";
import ImageViewing from "react-native-image-viewing";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

export type MessageBubbleProps = {
  message: string;
  timestamp: string;
  isOutgoing: boolean;
  imageUrls?: string[];
  viewOnce?: boolean;
  viewOnceOpened?: boolean;
  onViewOncePress?: () => void;
};

export function MessageBubble({
  message,
  timestamp,
  isOutgoing,
  imageUrls = [],
  viewOnce = false,
  viewOnceOpened = false,
  onViewOncePress,
}: MessageBubbleProps) {
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);

  const hasImages = imageUrls.length > 0;
  const hasText = !!message && message.trim().length > 0;

  // For view-once messages that haven't been opened (from other user), show the "(1) Photo" placeholder
  const showViewOncePlaceholder = viewOnce && !viewOnceOpened && !isOutgoing;
  // For view-once messages that have been opened, show "Photo opened"
  const showViewOnceOpenedMessage = viewOnce && viewOnceOpened && !isOutgoing;
  // For outgoing view-once messages, show "Photo" indicator (sender can't view their own)
  const showOutgoingViewOnceIndicator = viewOnce && isOutgoing;

  const screenWidth = Dimensions.get("window").width;
  const maxImageWidth = screenWidth * 0.6; // 60% of screen width for images
  const gridImageSize = (maxImageWidth - 4) / 2; // Size for 2-column grid with gap

  const handleImagePress = (index: number) => {
    setViewerImageIndex(index);
    setIsViewerVisible(true);
  };

  // Render view-once photo placeholder (both for incoming unopened and outgoing)
  if (showViewOncePlaceholder || showOutgoingViewOnceIndicator || showViewOnceOpenedMessage) {
    const placeholderText = showViewOnceOpenedMessage ? "Photo" : "Photo";
    const showOneIcon = !showViewOnceOpenedMessage;
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
            className={`flex-row gap-2 items-center px-3 py-2 rounded-xl max-w-[80%] ${
              isOutgoing
                ? "bg-[#f7cfb0] rounded-bl-xl rounded-tl-xl rounded-tr-xl"
                : "bg-[#26272b] rounded-br-xl rounded-tl-xl rounded-tr-xl"
            }`}
          >
            <View className="flex-row items-center gap-1.5">
              {showOneIcon && <ViewOnceIcon isOutgoing={isOutgoing} />}
              {showViewOnceOpenedMessage && <OpenedIcon isOutgoing={isOutgoing} />}
              <Text
                className={`text-sm leading-5 ${
                  isOutgoing ? "text-[#26272b]" : "text-[#d1d1d6]"
                }`}
              >
                {placeholderText}
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

  // If there's no image, use the original layout
  if (!hasImages) {
    return (
      <View
        className={`flex-col ${isOutgoing ? "items-end" : "items-start"} mb-3`}
      >
        <View
          className={`flex-row gap-4 items-center px-3 py-2 rounded-xl max-w-[80%] ${
            isOutgoing
              ? "bg-[#f7cfb0] rounded-bl-xl rounded-tl-xl rounded-tr-xl"
              : "bg-[#26272b] rounded-br-xl rounded-tl-xl rounded-tr-xl"
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
        className={`flex-col gap-2 rounded-xl max-w-[80%] ${
          isOutgoing
            ? "bg-[#f7cfb0] rounded-bl-xl rounded-tl-xl rounded-tr-xl"
            : "bg-[#26272b] rounded-br-xl rounded-tl-xl rounded-tr-xl"
        } ${hasText ? "px-3 py-2" : "p-0"}`}
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
