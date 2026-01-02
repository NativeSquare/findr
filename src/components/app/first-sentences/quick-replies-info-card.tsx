import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Info } from "lucide-react-native";
import { View } from "react-native";

export function QuickRepliesInfoCard() {
  return (
    <View className="bg-[#1a1a1e] border border-[#26272b] rounded-xl p-4 flex-row gap-3">
      <View className="bg-[#e56400] rounded-full size-9 items-center justify-center shrink-0">
        <Icon as={Info} size={20} className="text-white" />
      </View>
      <View className="flex-col gap-1 flex-1">
        <Text className="text-sm font-medium leading-5 text-white">
          Quick Replies
        </Text>
        <Text className="text-xs leading-[18px] text-[#d1d1d6]">
          Customize the quick reply bubbles that appear when you start a new
          conversation. Tap to send instantly.
        </Text>
      </View>
    </View>
  );
}
