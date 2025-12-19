import { OptionButton } from "@/components/app/onboarding/option-button";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export type PositionFieldProps = {
  label?: string;
  onSelect: (option: string) => void;
  isSelected: (option: string) => boolean;
};

export function PositionField({
  label = "Position",
  onSelect,
  isSelected,
}: PositionFieldProps) {
  const POSITIONS = ["Top", "Bottom", "Versatile", "Side", "Ask Me"];

  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {POSITIONS.map((option, index) => (
          <OptionButton
            key={index}
            option={option}
            onPress={() => onSelect(option)}
            isSelected={isSelected(option)}
          />
        ))}
      </View>
    </View>
  );
}
