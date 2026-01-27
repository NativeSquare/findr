import { Text } from "@/components/ui/text";
import type { MeasurementSystem } from "@/utils/measurements";
import { kgToLbs } from "@/utils/measurements";
import { Picker } from "@react-native-picker/picker";
import * as React from "react";
import { Platform, useColorScheme, View } from "react-native";

export type WeightPickerProps = {
  minWeight: number;
  maxWeight: number;
  onMinWeightChange: (weight: number) => void;
  onMaxWeightChange: (weight: number) => void;
  minValue?: number;
  maxValue?: number;
  measurementSystem?: MeasurementSystem;
};

const DEFAULT_MIN_WEIGHT = 40; // kg
const DEFAULT_MAX_WEIGHT = 150; // kg

function formatWeightLabel(kg: number, system: MeasurementSystem): string {
  if (system === "imperial") {
    return `${kgToLbs(kg)} lbs`;
  }
  return `${kg} kg`;
}

export function WeightPicker({
  minWeight,
  maxWeight,
  onMinWeightChange,
  onMaxWeightChange,
  minValue = DEFAULT_MIN_WEIGHT,
  maxValue = DEFAULT_MAX_WEIGHT,
  measurementSystem = "metric",
}: WeightPickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [internalMinWeight, setInternalMinWeight] = React.useState(minWeight);
  const [internalMaxWeight, setInternalMaxWeight] = React.useState(maxWeight);

  React.useEffect(() => {
    setInternalMinWeight(minWeight);
  }, [minWeight]);

  React.useEffect(() => {
    setInternalMaxWeight(maxWeight);
  }, [maxWeight]);

  const weightOptions = Array.from(
    { length: maxValue - minValue + 1 },
    (_, i) => minValue + i
  );

  const handleMinWeightChange = (value: number) => {
    const newMinWeight = Math.min(value, internalMaxWeight);
    setInternalMinWeight(newMinWeight);
    onMinWeightChange(newMinWeight);
  };

  const handleMaxWeightChange = (value: number) => {
    const newMaxWeight = Math.max(value, internalMinWeight);
    setInternalMaxWeight(newMaxWeight);
    onMaxWeightChange(newMaxWeight);
  };

  const textColor = isDark ? "#fafafa" : "#0a0a0a";
  const iconColor = isDark ? "#a1a1aa" : "#71717a";

  return (
    <View className="gap-4">
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground mb-2">Min Weight</Text>
          <View className="border border-input rounded-md overflow-hidden bg-background">
            <Picker
              selectedValue={internalMinWeight}
              onValueChange={handleMinWeightChange}
              style={{
                color: textColor,
                ...(Platform.OS === "android" && { height: 50 }),
              }}
              dropdownIconColor={iconColor}
            >
              {weightOptions.map((weight) => (
                <Picker.Item
                  key={weight}
                  label={formatWeightLabel(weight, measurementSystem)}
                  value={weight}
                  enabled={weight <= internalMaxWeight}
                  color={weight <= internalMaxWeight ? textColor : iconColor}
                />
              ))}
            </Picker>
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground mb-2">Max Weight</Text>
          <View className="border border-input rounded-md overflow-hidden bg-background">
            <Picker
              selectedValue={internalMaxWeight}
              onValueChange={handleMaxWeightChange}
              style={{
                color: textColor,
                ...(Platform.OS === "android" && { height: 50 }),
              }}
              dropdownIconColor={iconColor}
            >
              {weightOptions.map((weight) => (
                <Picker.Item
                  key={weight}
                  label={formatWeightLabel(weight, measurementSystem)}
                  value={weight}
                  enabled={weight >= internalMinWeight}
                  color={weight >= internalMinWeight ? textColor : iconColor}
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
}
