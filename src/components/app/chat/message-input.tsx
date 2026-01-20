import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
}: MessageInputProps) {
  const hasContent = value.trim().length > 0 || attachedImageUris.length > 0;
  const isDisabled = !hasContent || isLoading;

  return (
    <View className="px-5 pb-4">
      {attachedImageUris.length > 0 && (
        <View className="mb-2">
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
          className="flex-1"
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
