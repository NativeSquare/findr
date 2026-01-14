import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Send } from "lucide-react-native";
import { View } from "react-native";

export type MessageInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onCameraPress?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
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
}: MessageInputProps) {
  return (
    <View className="flex-row gap-2 items-end px-5 pb-4">
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
      <Button variant="default" size="icon" onPress={onSend}>
        <Icon as={Send} size={20} className="text-white" />
      </Button>
    </View>
  );
}
