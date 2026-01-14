import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

export type PreferenceSectionHeaderProps = {
  icon: LucideIcon;
  title: string;
};

export function PreferenceSectionHeader({
  icon,
  title,
}: PreferenceSectionHeaderProps) {
  return (
    <View className="flex-row items-center gap-2 py-3">
      <Icon as={icon} size={16} className="text-muted-foreground" />
      <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </Text>
    </View>
  );
}
