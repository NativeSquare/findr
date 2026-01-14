import { Text } from "@/components/ui/text";
import { Picker } from "@react-native-picker/picker";
import * as React from "react";
import { Platform, useColorScheme, View } from "react-native";

export type AgePickerProps = {
  minAge: number;
  maxAge: number;
  onMinAgeChange: (age: number) => void;
  onMaxAgeChange: (age: number) => void;
  minValue?: number;
  maxValue?: number;
};

const DEFAULT_MIN_AGE = 18;
const DEFAULT_MAX_AGE = 100;

export function AgePicker({
  minAge,
  maxAge,
  onMinAgeChange,
  onMaxAgeChange,
  minValue = DEFAULT_MIN_AGE,
  maxValue = DEFAULT_MAX_AGE,
}: AgePickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Use internal state to prevent iOS wheel picker double-animation bug
  // The picker animates when selectedValue prop changes, causing a visual flicker
  // when used as a fully controlled component
  const [internalMinAge, setInternalMinAge] = React.useState(minAge);
  const [internalMaxAge, setInternalMaxAge] = React.useState(maxAge);

  // Sync internal state when props change from external source
  React.useEffect(() => {
    setInternalMinAge(minAge);
  }, [minAge]);

  React.useEffect(() => {
    setInternalMaxAge(maxAge);
  }, [maxAge]);

  // Generate age options
  const ageOptions = Array.from(
    { length: maxValue - minValue + 1 },
    (_, i) => minValue + i
  );

  const handleMinAgeChange = (value: number) => {
    // Ensure min age doesn't exceed max age
    const newMinAge = Math.min(value, internalMaxAge);
    setInternalMinAge(newMinAge);
    onMinAgeChange(newMinAge);
  };

  const handleMaxAgeChange = (value: number) => {
    // Ensure max age isn't less than min age
    const newMaxAge = Math.max(value, internalMinAge);
    setInternalMaxAge(newMaxAge);
    onMaxAgeChange(newMaxAge);
  };

  // Colors for picker styling
  const textColor = isDark ? "#fafafa" : "#0a0a0a";
  const iconColor = isDark ? "#a1a1aa" : "#71717a";

  return (
    <View className="gap-4">
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground mb-2">Min Age</Text>
          <View className="border border-input rounded-md overflow-hidden bg-background">
            <Picker
              selectedValue={internalMinAge}
              onValueChange={handleMinAgeChange}
              style={{
                color: textColor,
                ...(Platform.OS === "android" && { height: 50 }),
              }}
              dropdownIconColor={iconColor}
            >
              {ageOptions.map((age) => (
                <Picker.Item
                  key={age}
                  label={age.toString()}
                  value={age}
                  enabled={age <= internalMaxAge}
                  color={age <= internalMaxAge ? textColor : iconColor}
                />
              ))}
            </Picker>
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground mb-2">Max Age</Text>
          <View className="border border-input rounded-md overflow-hidden bg-background">
            <Picker
              selectedValue={internalMaxAge}
              onValueChange={handleMaxAgeChange}
              style={{
                color: textColor,
                ...(Platform.OS === "android" && { height: 50 }),
              }}
              dropdownIconColor={iconColor}
            >
              {ageOptions.map((age) => (
                <Picker.Item
                  key={age}
                  label={age.toString()}
                  value={age}
                  enabled={age >= internalMinAge}
                  color={age >= internalMinAge ? textColor : iconColor}
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
}
