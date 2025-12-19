import { OptionButton } from "@/components/app/onboarding/option-button";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export type BodyTypesFieldProps = {
  label?: string;
  onSelect: (option: string) => void;
  isSelected: (option: string) => boolean;
};

export function BodyTypesField({
  label = "Body Types",
  onSelect,
  isSelected,
}: BodyTypesFieldProps) {
  const BODY_TYPES = ["Slim", "Average", "Athletic", "Muscular", "Stocky"];

  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {BODY_TYPES.map((option, index) => (
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
