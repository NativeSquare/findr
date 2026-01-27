import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Send, X } from "lucide-react-native";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";

export type MessageInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onCameraPress?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  attachedImageUris?: string[];
  onRemoveImage?: (index: number) => void;
  isLoading?: boolean;
  /** Whether view-once mode is enabled */
  isViewOnce?: boolean;
  /** Callback to toggle view-once mode */
  onToggleViewOnce?: () => void;
  /** Whether to show the view-once toggle (only shown when images are attached) */
  showViewOnceOption?: boolean;
};

export function MessageInput({
  value,
  onChangeText,
  onSend,
  onCameraPress,
  placeholder = "Send message...",
  autoFocus = false,
  onFocus,
  onBlur,
  attachedImageUris = [],
  onRemoveImage,
  isLoading = false,
  isViewOnce = false,
  onToggleViewOnce,
  showViewOnceOption = false,
}: MessageInputProps) {
  const hasContent = value.trim().length > 0 || attachedImageUris.length > 0;
  const isDisabled = !hasContent || isLoading;
  const hasImages = attachedImageUris.length > 0;

  return (
    <View className="px-5 pb-4">
      {hasImages && (
        <View className="mb-2">
          <View className="flex-row items-center justify-between mb-2">
            {showViewOnceOption && (
              <Pressable
                onPress={onToggleViewOnce}
                className="flex-row items-center gap-2"
              >
                <ViewOnceIcon active={isViewOnce} />
                <Text className={`text-sm ${isViewOnce ? "text-white" : "text-[#70707b]"}`}>
                  View once
                </Text>
              </Pressable>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {attachedImageUris.map((uri, index) => (
              <View key={`${uri}-${index}`} className="relative">
                <Image
                  source={{ uri }}
                  className="w-20 h-20 rounded-lg"
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => onRemoveImage?.(index)}
                  className="absolute -top-2 -right-2 bg-[#26272b] rounded-full p-1"
                >
                  <Icon as={X} size={14} className="text-white" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      <View className="flex-row gap-2 items-end">
        <Button variant="secondary" size="icon" onPress={onCameraPress}>
          <Icon as={Camera} size={20} className="text-white" />
        </Button>
        <Textarea
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          className="flex-1 rounded-3xl"
          autoFocus={autoFocus}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <Button
          variant="default"
          size="icon"
          onPress={onSend}
          disabled={isDisabled}
          className={isDisabled ? "opacity-50" : ""}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Icon as={Send} size={20} className="text-white" />
          )}
        </Button>
      </View>
    </View>
  );
}

function ViewOnceIcon({ active }: { active: boolean }) {
  return (
    <View className="relative h-5 w-5 items-center justify-center">
      {/* Circle outline */}
      <View
        className={`absolute h-5 w-5 rounded-full border-[1.5px] ${
          active ? "border-white" : "border-[#70707b]"
        }`}
      />
      {/* Number 1 in center */}
      <Text
        className={`text-[10px] font-semibold ${active ? "text-white" : "text-[#70707b]"}`}
      >
        1
      </Text>
    </View>
  );
}
