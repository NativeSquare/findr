import { Text } from "@/components/ui/text";
import type { MeasurementSystem } from "@/utils/measurements";
import { cmToFeetInches } from "@/utils/measurements";
import { Picker } from "@react-native-picker/picker";
import * as React from "react";
import { Platform, useColorScheme, View } from "react-native";

export type HeightPickerProps = {
  minHeight: number;
  maxHeight: number;
  onMinHeightChange: (height: number) => void;
  onMaxHeightChange: (height: number) => void;
  minValue?: number;
  maxValue?: number;
  measurementSystem?: MeasurementSystem;
};

const DEFAULT_MIN_HEIGHT = 120; // cm
const DEFAULT_MAX_HEIGHT = 220; // cm

function formatHeightLabel(cm: number, system: MeasurementSystem): string {
  if (system === "imperial") {
    const { feet, inches } = cmToFeetInches(cm);
    return `${feet}'${inches}"`;
  }
  return `${cm} cm`;
}

export function HeightPicker({
  minHeight,
  maxHeight,
  onMinHeightChange,
  onMaxHeightChange,
  minValue = DEFAULT_MIN_HEIGHT,
  maxValue = DEFAULT_MAX_HEIGHT,
  measurementSystem = "metric",
}: HeightPickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [internalMinHeight, setInternalMinHeight] = React.useState(minHeight);
  const [internalMaxHeight, setInternalMaxHeight] = React.useState(maxHeight);

  React.useEffect(() => {
    setInternalMinHeight(minHeight);
  }, [minHeight]);

  React.useEffect(() => {
    setInternalMaxHeight(maxHeight);
  }, [maxHeight]);

  const heightOptions = Array.from(
    { length: maxValue - minValue + 1 },
    (_, i) => minValue + i
  );

  const handleMinHeightChange = (value: number) => {
    const newMinHeight = Math.min(value, internalMaxHeight);
    setInternalMinHeight(newMinHeight);
    onMinHeightChange(newMinHeight);
  };

  const handleMaxHeightChange = (value: number) => {
    const newMaxHeight = Math.max(value, internalMinHeight);
    setInternalMaxHeight(newMaxHeight);
    onMaxHeightChange(newMaxHeight);
  };

  const textColor = isDark ? "#fafafa" : "#0a0a0a";
  const iconColor = isDark ? "#a1a1aa" : "#71717a";

  return (
    <View className="gap-4">
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground mb-2">Min Height</Text>
          <View className="border border-input rounded-md overflow-hidden bg-background">
            <Picker
              selectedValue={internalMinHeight}
              onValueChange={handleMinHeightChange}
              style={{
                color: textColor,
                ...(Platform.OS === "android" && { height: 50 }),
              }}
              dropdownIconColor={iconColor}
            >
              {heightOptions.map((height) => (
                <Picker.Item
                  key={height}
                  label={formatHeightLabel(height, measurementSystem)}
                  value={height}
                  enabled={height <= internalMaxHeight}
                  color={height <= internalMaxHeight ? textColor : iconColor}
                />
              ))}
            </Picker>
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground mb-2">Max Height</Text>
          <View className="border border-input rounded-md overflow-hidden bg-background">
            <Picker
              selectedValue={internalMaxHeight}
              onValueChange={handleMaxHeightChange}
              style={{
                color: textColor,
                ...(Platform.OS === "android" && { height: 50 }),
              }}
              dropdownIconColor={iconColor}
            >
              {heightOptions.map((height) => (
                <Picker.Item
                  key={height}
                  label={formatHeightLabel(height, measurementSystem)}
                  value={height}
                  enabled={height >= internalMinHeight}
                  color={height >= internalMinHeight ? textColor : iconColor}
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
}
