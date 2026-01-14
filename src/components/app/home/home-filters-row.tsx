import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Filter } from "lucide-react-native";
import { ScrollView, View } from "react-native";

export type HomeFiltersRowProps = {
  hasActiveFilters: boolean;
  activeFilterLabels: string[];
  onFilterPress: () => void;
  onClearAll: () => void;
};

export function HomeFiltersRow({
  hasActiveFilters,
  activeFilterLabels,
  onFilterPress,
  onClearAll,
}: HomeFiltersRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 8 }}
    >
      <Button
        variant={hasActiveFilters ? "default" : "outline"}
        size="sm"
        className="flex-row items-center gap-1.5"
        onPress={onFilterPress}
      >
        <Icon as={Filter} size={16} />
      </Button>
      {activeFilterLabels.map((label, index) => (
        <View
          key={index}
          className="bg-white rounded-md px-3 py-1.5 justify-center"
        >
          <Text className="text-sm font-medium text-black">{label}</Text>
        </View>
      ))}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onPress={onClearAll}
          className="shrink-0"
        >
          <Text className="text-sm text-muted-foreground">Clear All</Text>
        </Button>
      )}
    </ScrollView>
  );
}
