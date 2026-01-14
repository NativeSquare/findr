import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Send, X } from "lucide-react-native";
import { Image, Pressable, View } from "react-native";

export type MessageInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onCameraPress?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  attachedImageUri?: string | null;
  onRemoveImage?: () => void;
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
  attachedImageUri,
  onRemoveImage,
}: MessageInputProps) {
  const hasContent = value.trim().length > 0 || !!attachedImageUri;

  return (
    <View className="px-5 pb-4">
      {attachedImageUri && (
        <View className="mb-2">
          <View className="relative self-start">
            <Image
              source={{ uri: attachedImageUri }}
              className="w-20 h-20 rounded-lg"
              resizeMode="cover"
            />
            <Pressable
              onPress={onRemoveImage}
              className="absolute -top-2 -right-2 bg-[#26272b] rounded-full p-1"
            >
              <Icon as={X} size={14} className="text-white" />
            </Pressable>
          </View>
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
          disabled={!hasContent}
          className={!hasContent ? "opacity-50" : ""}
        >
          <Icon as={Send} size={20} className="text-white" />
        </Button>
      </View>
    </View>
  );
}
