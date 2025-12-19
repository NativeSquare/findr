import { OptionButton } from "@/components/shared/option-button";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export type EthnicityFieldProps = {
  label?: string;
  onSelect: (option: string) => void;
  isSelected: (option: string) => boolean;
};

export function EthnicityField({
  label = "Ethnicity",
  onSelect,
  isSelected,
}: EthnicityFieldProps) {
  const ETHNICITIES = [
    "Asian",
    "Black",
    "Latino/Hispanic",
    "Middle Eastern",
    "Mixed",
    "Native American",
    "Pacific Islander",
    "South Asian",
    "White",
    "Other",
  ];

  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {ETHNICITIES.map((option, index) => (
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
