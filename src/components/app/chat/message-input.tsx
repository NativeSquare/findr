import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Camera, Send } from "lucide-react-native";
import { View } from "react-native";

export type MessageInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onCameraPress?: () => void;
  placeholder?: string;
};

export function MessageInput({
  value,
  onChangeText,
  onSend,
  onCameraPress,
  placeholder = "Send message...",
}: MessageInputProps) {
  return (
    <View className="flex-row gap-2 items-center px-5 pb-4">
      <Button
        variant="ghost"
        size="icon"
        className="size-5 shrink-0"
        onPress={onCameraPress}
      >
        <Icon as={Camera} size={20} className="text-white" />
      </Button>
      <View className="flex-1 bg-[#131316] border border-[#1a1a1e] rounded-[30px] h-10 px-[14px] py-[10px]">
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#70707b"
          className="text-xs leading-[18px] text-white h-auto p-0 border-0"
          multiline
        />
      </View>
      <Button
        variant="default"
        size="icon"
        className="bg-[#e56400] size-10 rounded-[30px] shrink-0"
        onPress={onSend}
      >
        <Icon as={Send} size={20} className="text-white" />
      </Button>
    </View>
  );
}
