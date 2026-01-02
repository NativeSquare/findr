import { Text } from "@/components/ui/text";
import { Pressable, View } from "react-native";

export type QuickRepliesProps = {
  replies: string[];
  onReplySelect: (reply: string) => void;
};

export function QuickReplies({ replies, onReplySelect }: QuickRepliesProps) {
  if (replies.length === 0) return null;

  return (
    <View className="flex-col gap-3 px-5 pb-4">
      {replies.length > 0 && (
        <View className="flex-row gap-2 flex-wrap">
          {replies.slice(0, 3).map((reply, index) => (
            <Pressable
              key={index}
              onPress={() => onReplySelect(reply)}
              className="border border-[#e56400] rounded-lg px-3 py-1 active:opacity-70"
            >
              <Text className="text-base leading-6 text-[#e56400]">
                {reply}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {replies.length > 3 && (
        <Pressable
          onPress={() => onReplySelect(replies[3])}
          className="border border-[#e56400] rounded-lg px-3 py-1 self-start active:opacity-70"
        >
          <Text className="text-base leading-6 text-[#e56400]">
            {replies[3]}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
