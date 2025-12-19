import { OptionButton } from "@/components/app/onboarding/option-button";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export type SexualOrientationFieldProps = {
  label?: string;
  onSelect: (option: string) => void;
  isSelected: (option: string) => boolean;
};

export function SexualOrientationField({
  label = "Sexual Orientation",
  onSelect,
  isSelected,
}: SexualOrientationFieldProps) {
  const ORIENTATIONS = [
    "Straight",
    "Gay",
    "Bisexual",
    "Queer",
    "Pansexual",
    "Asexual",
    "Demisexual",
    "Ask Me",
  ];

  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {ORIENTATIONS.map((option, index) => (
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
