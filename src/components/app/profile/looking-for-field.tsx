import { OptionButton } from "@/components/app/onboarding/option-button";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export type LookingForFieldProps = {
  label?: string;
  onSelect: (option: string) => void;
  isSelected: (option: string) => boolean;
};

export function LookingForField({
  label = "Looking for",
  onSelect,
  isSelected,
}: LookingForFieldProps) {
  const LOOKING_FOR = ["Connections", "Friends", "Dating"];

  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {LOOKING_FOR.map((option, index) => (
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
