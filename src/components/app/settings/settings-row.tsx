import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react-native";
import { Pressable } from "react-native";

export type SettingItem = {
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
  onPress?: () => void;
};

export function SettingsRow({
  label,
  icon,
  destructive,
  onPress,
}: SettingItem) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-4 py-4 border-b border-[#1a1a1e]",
        "active:opacity-70"
      )}
    >
      <Icon
        as={icon}
        size={20}
        className={destructive ? "text-[#f97066]" : "text-[#d1d1d6]"}
      />
      <Text
        className={cn(
          "text-sm font-medium",
          destructive ? "text-[#f97066]" : "text-[#d1d1d6]"
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
