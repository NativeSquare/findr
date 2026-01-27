import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ScrollView, View } from "react-native";

export type HomeFiltersRowProps = {
  activeFilterLabels: string[];
  onClearAll: () => void;
};

export function HomeFiltersRow({
  activeFilterLabels,
  onClearAll,
}: HomeFiltersRowProps) {
  if (activeFilterLabels.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 8 }}
    >
      {activeFilterLabels.map((label, index) => (
        <View
          key={index}
          className="bg-white rounded-md px-3 py-1.5 justify-center"
        >
          <Text className="text-sm font-medium text-black">{label}</Text>
        </View>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onPress={onClearAll}
        className="shrink-0"
      >
        <Text className="text-sm text-muted-foreground">Clear All</Text>
      </Button>
    </ScrollView>
  );
}
