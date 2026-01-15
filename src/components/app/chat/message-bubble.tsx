import { Text } from "@/components/ui/text";
import { Dimensions, Image, View } from "react-native";

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
  const hasImages = imageUrls.length > 0;
  const hasText = !!message && message.trim().length > 0;

  const screenWidth = Dimensions.get("window").width;
  const maxImageWidth = screenWidth * 0.6; // 60% of screen width for images
  const gridImageSize = (maxImageWidth - 4) / 2; // Size for 2-column grid with gap

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
      );
    }

    if (imageUrls.length === 2) {
      // Two images side by side
      return (
        <View style={{ flexDirection: "row", gap: 4, width: maxImageWidth }}>
          {imageUrls.map((url, index) => (
            <View
              key={`${url}-${index}`}
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
          <View
            key={`${url}-${index}`}
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
        ))}
      </View>
    );
  };

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
    </View>
  );
}
