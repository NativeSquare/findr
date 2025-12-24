import { OptionButton } from "@/components/shared/option-button";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export type FeedbackTypeFieldProps = {
  label?: string;
  onSelect: (option: string) => void;
  isSelected: (option: string) => boolean;
  error?: string;
};

export function FeedbackTypeField({
  label = "Feedback Type",
  onSelect,
  isSelected,
  error,
}: FeedbackTypeFieldProps) {
  const FEEDBACK_TYPES = ["Bug Report", "Feature Request", "General Feedback"];

  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {FEEDBACK_TYPES.map((option, index) => (
          <OptionButton
            key={index}
            option={option}
            onPress={() => onSelect(option)}
            isSelected={isSelected(option)}
          />
        ))}
      </View>
      {error && <Text className="text-xs text-destructive mt-1">{error}</Text>}
    </View>
  );
}
