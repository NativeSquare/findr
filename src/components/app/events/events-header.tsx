import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { CirclePlus, SlidersHorizontal } from "lucide-react-native";
import { View } from "react-native";

export type EventsHeaderProps = {
  hasActiveFilters?: boolean;
  onFilterPress?: () => void;
  onCreatePress?: () => void;
};

export function EventsHeader({
  hasActiveFilters,
  onFilterPress,
  onCreatePress,
}: EventsHeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-xl font-medium text-white">Events</Text>
      <View className="flex-row items-center gap-3">
        <Button
          variant={hasActiveFilters ? "default" : "ghost"}
          size="icon"
          onPress={onFilterPress}
        >
          <Icon as={SlidersHorizontal} size={22} className="text-white" />
        </Button>
        <Button variant="ghost" size="icon" onPress={onCreatePress}>
          <Icon as={CirclePlus} size={22} className="text-white" />
        </Button>
      </View>
    </View>
  );
}
