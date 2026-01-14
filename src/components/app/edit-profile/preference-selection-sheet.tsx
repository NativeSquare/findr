import { OptionButton } from "@/components/shared/option-button";
import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import React from "react";
import { View } from "react-native";

export type PreferenceSelectionSheetProps = {
  bottomSheetRef: React.RefObject<GorhomBottomSheetModal | null>;
  title: string;
  options: string[];
  selectedValues: string | string[] | undefined;
  multiSelect?: boolean;
  onSelect: (value: string) => void;
  onDone?: () => void;
};

export function PreferenceSelectionSheet({
  bottomSheetRef,
  title,
  options,
  selectedValues,
  multiSelect = false,
  onSelect,
  onDone,
}: PreferenceSelectionSheetProps) {
  const isSelected = (option: string) => {
    if (Array.isArray(selectedValues)) {
      return selectedValues.includes(option);
    }
    return selectedValues === option;
  };

  const handleDone = () => {
    onDone?.();
    bottomSheetRef.current?.dismiss();
  };

  return (
    <BottomSheetModal ref={bottomSheetRef}>
      <View className="px-4 pb-6 gap-6">
        <Text className="text-xl font-semibold text-foreground">{title}</Text>

        <View className="flex-row flex-wrap gap-2">
          {options.map((option) => (
            <OptionButton
              key={option}
              option={option}
              onPress={() => onSelect(option)}
              isSelected={isSelected(option)}
            />
          ))}
        </View>

        <Button onPress={handleDone}>
          <Text className="text-base font-medium text-primary-foreground">
            Done
          </Text>
        </Button>
      </View>
    </BottomSheetModal>
  );
}
