import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { MeasurementSystem } from "@/utils/measurements";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { Check } from "lucide-react-native";
import { forwardRef } from "react";
import { Pressable, View } from "react-native";

type MeasurementSystemSheetProps = {
  value: MeasurementSystem;
  onChange: (value: MeasurementSystem) => void;
};

export const MeasurementSystemSheet = forwardRef<
  GorhomBottomSheetModal,
  MeasurementSystemSheetProps
>(({ value, onChange }, ref) => {
  const options: { value: MeasurementSystem; label: string; description: string }[] = [
    {
      value: "metric",
      label: "Metric",
      description: "Centimeters, Kilograms, Kilometers",
    },
    {
      value: "imperial",
      label: "Imperial",
      description: "Feet/Inches, Pounds, Miles",
    },
  ];

  return (
    <BottomSheetModal ref={ref}>
      <View className="px-4 pb-6 gap-4">
        <Text className="text-xl font-semibold text-foreground">
          Measurement System
        </Text>
        <View className="gap-2">
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value);
                (ref as React.RefObject<GorhomBottomSheetModal>)?.current?.dismiss();
              }}
              className="flex-row items-center justify-between py-4 px-4 rounded-xl bg-secondary/30 active:opacity-70"
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-foreground">
                  {option.label}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {option.description}
                </Text>
              </View>
              {value === option.value && (
                <Icon as={Check} size={20} className="text-primary" />
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </BottomSheetModal>
  );
});

MeasurementSystemSheet.displayName = "MeasurementSystemSheet";
