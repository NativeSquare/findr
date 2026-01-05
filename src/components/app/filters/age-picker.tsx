import { Text } from "@/components/ui/text";
import { Picker } from "@react-native-picker/picker";
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

  // Generate age options
  const ageOptions = Array.from(
    { length: maxValue - minValue + 1 },
    (_, i) => minValue + i
  );

  const handleMinAgeChange = (value: number) => {
    // Ensure min age doesn't exceed max age
    const newMinAge = Math.min(value, maxAge);
    onMinAgeChange(newMinAge);
  };

  const handleMaxAgeChange = (value: number) => {
    // Ensure max age isn't less than min age
    const newMaxAge = Math.max(value, minAge);
    onMaxAgeChange(newMaxAge);
  };

  // Colors for picker styling
  const textColor = isDark ? "#fafafa" : "#0a0a0a";
  const iconColor = isDark ? "#a1a1aa" : "#71717a";

  return (
    <View className="gap-4">
      <Text className="text-sm text-muted-foreground">
        Age Range: {minAge} - {maxAge}
      </Text>
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground mb-2">Min Age</Text>
          <View className="border border-input rounded-md overflow-hidden bg-background">
            <Picker
              selectedValue={minAge}
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
                  enabled={age <= maxAge}
                  color={age <= maxAge ? textColor : iconColor}
                />
              ))}
            </Picker>
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground mb-2">Max Age</Text>
          <View className="border border-input rounded-md overflow-hidden bg-background">
            <Picker
              selectedValue={maxAge}
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
                  enabled={age >= minAge}
                  color={age >= minAge ? textColor : iconColor}
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
}
