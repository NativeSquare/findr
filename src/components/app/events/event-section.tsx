import { Text } from "@/components/ui/text";
import { View } from "react-native";

export type EventSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function EventSection({ title, children }: EventSectionProps) {
  return (
    <View className="gap-4">
      <Text className="text-lg font-medium text-white">{title}</Text>
      {children}
    </View>
  );
}
