import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";

export type PreferenceRowProps = {
  label: string;
  values?: string | string[];
  onPress: () => void;
  isLast?: boolean;
};

export function PreferenceRow({
  label,
  values,
  onPress,
  isLast,
}: PreferenceRowProps) {
  const displayValue = Array.isArray(values)
    ? values.join(", ")
    : values || "";

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center justify-between py-4 px-4 bg-[#1a1a1e] active:opacity-70",
        !isLast && "border-b border-[#2a2a2e]"
      )}
    >
      <Text className="text-sm font-medium text-[#d1d1d6]">{label}</Text>
      <View className="flex-row items-center gap-2 flex-1 justify-end ml-4">
        <Text
          className="text-sm text-muted-foreground text-right flex-shrink"
          numberOfLines={1}
        >
          {displayValue}
        </Text>
        <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
      </View>
    </Pressable>
  );
}
