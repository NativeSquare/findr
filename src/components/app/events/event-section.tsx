import { Text } from "@/components/ui/text";
import { Pressable, View } from "react-native";

export type EventSectionProps = {
  title: string;
  onViewAll?: () => void;
  children: React.ReactNode;
};

export function EventSection({
  title,
  onViewAll,
  children,
}: EventSectionProps) {
  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-medium text-white">{title}</Text>
        {onViewAll && (
          <Pressable onPress={onViewAll}>
            <Text className="text-xs font-medium text-white underline">
              View all
            </Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}
