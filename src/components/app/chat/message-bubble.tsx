import { Text } from "@/components/ui/text";
import { useState } from "react";
import { Dimensions, Image, Pressable, View } from "react-native";
import ImageViewing from "react-native-image-viewing";

export type MessageBubbleProps = {
  message: string;
  timestamp: string;
  isOutgoing: boolean;
  imageUrls?: string[];
};

export function MessageBubble({
  message,
  timestamp,
  isOutgoing,
  imageUrls = [],
}: MessageBubbleProps) {
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);

  const hasImages = imageUrls.length > 0;
  const hasText = !!message && message.trim().length > 0;

  const screenWidth = Dimensions.get("window").width;
  const maxImageWidth = screenWidth * 0.6; // 60% of screen width for images
  const gridImageSize = (maxImageWidth - 4) / 2; // Size for 2-column grid with gap

  const handleImagePress = (index: number) => {
    setViewerImageIndex(index);
    setIsViewerVisible(true);
  };

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
