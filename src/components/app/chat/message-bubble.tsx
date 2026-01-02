import { Text } from "@/components/ui/text";
import { Dimensions, Image, View } from "react-native";

export type MessageBubbleProps = {
  message: string;
  timestamp: string;
  isOutgoing: boolean;
  imageUrl?: string;
};

export function MessageBubble({
  message,
  timestamp,
  isOutgoing,
  imageUrl,
}: MessageBubbleProps) {
  const hasImage = !!imageUrl;
  const hasText = !!message && message.trim().length > 0;

  const screenWidth = Dimensions.get("window").width;
  const maxImageWidth = screenWidth * 0.6; // 60% of screen width for images

  // If there's no image, use the original layout
  if (!hasImage) {
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

  // If there's an image, use the new layout
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
        {hasImage && imageUrl && (
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
              source={{ uri: imageUrl }}
              style={{ width: maxImageWidth, height: 200 }}
              resizeMode="cover"
              onError={(error) => {
                console.error("Image load error:", error);
              }}
            />
          </View>
        )}
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
