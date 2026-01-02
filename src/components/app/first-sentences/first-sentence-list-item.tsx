import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Edit2, Trash2 } from "lucide-react-native";
import { Pressable, View } from "react-native";

export type FirstSentenceListItemProps = {
  sentence: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function FirstSentenceListItem({
  sentence,
  onEdit,
  onDelete,
}: FirstSentenceListItemProps) {
  return (
    <View className="bg-[#131316] border border-[#1a1a1e] rounded-lg p-3 flex-row gap-2 items-center">
      <Text className="flex-1 text-sm font-medium leading-5 text-[#d1d1d6]">
        {sentence}
      </Text>
      <View className="flex-row gap-3 items-center">
        <Pressable onPress={onEdit} className="active:opacity-70">
          <Icon as={Edit2} size={20} className="text-[#d1d1d6]" />
        </Pressable>
        <Pressable onPress={onDelete} className="active:opacity-70">
          <Icon as={Trash2} size={20} className="text-[#d1d1d6]" />
        </Pressable>
      </View>
    </View>
  );
}
