import { CalendarInput } from "@/components/custom/calendar-input";
import { Text } from "@/components/ui/text";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as React from "react";
import { Platform, Pressable, View } from "react-native";

export type BirthDateFieldProps = {
  label?: string;
  value?: string; // ISO8601 string (e.g., "2000-01-15T00:00:00Z")
  onChange?: (value: string) => void; // Receives ISO8601 string
  error?: boolean;
  errorMessage?: string;
};

function formatDateForDisplay(isoString?: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    // Format as YYYY-MM-DD for display
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

export function BirthDateField({
  label = "Date of Birth",
  value,
  onChange,
  error = false,
  errorMessage,
}: BirthDateFieldProps) {
  const [showPicker, setShowPicker] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date>(() => {
    if (value) {
      try {
        return new Date(value);
      } catch {
        return new Date();
      }
    }
    // Default to 18 years ago
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  });

  // Update internal date when value prop changes
  React.useEffect(() => {
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setInternalDate(date);
        }
      } catch {
        // Invalid date, keep current internal date
      }
    }
  }, [value]);

  const handleDateChange = (event: any, selectedDate?: Date | undefined) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (selectedDate) {
        setInternalDate(selectedDate);
        // Convert to ISO8601 string (date only, no time)
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        // Store as ISO8601 date string (YYYY-MM-DD format, which is valid ISO8601)
        const isoString = `${year}-${month}-${day}T00:00:00Z`;
        onChange?.(isoString);
      }
    } else if (Platform.OS === "ios") {
      // On iOS, onChange is called continuously as user scrolls
      // Only update internalDate, don't call onChange until "Done" is pressed
      if (selectedDate) {
        setInternalDate(selectedDate);
      }
    }
  };

  const handleDone = () => {
    // Convert current internalDate to ISO8601 and call onChange
    const year = internalDate.getFullYear();
    const month = String(internalDate.getMonth() + 1).padStart(2, "0");
    const day = String(internalDate.getDate()).padStart(2, "0");
    const isoString = `${year}-${month}-${day}T00:00:00Z`;
    onChange?.(isoString);
    setShowPicker(false);
  };

  const handlePress = () => {
    setShowPicker(true);
  };

  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Pressable onPress={handlePress}>
        <CalendarInput
          value={formatDateForDisplay(value)}
          placeholder="YYYY-MM-DD"
          editable={false}
          pointerEvents="none"
          className={error ? "border-destructive" : ""}
          aria-invalid={error}
        />
      </Pressable>
      {error && errorMessage && (
        <Text className="text-sm text-destructive">{errorMessage}</Text>
      )}
      {showPicker && (
        <DateTimePicker
          value={internalDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()} // Can't select future dates
          minimumDate={new Date(1900, 0, 1)} // Reasonable minimum date
        />
      )}
      {Platform.OS === "ios" && showPicker && (
        <View className="flex-row gap-2 mt-2">
          <Pressable
            onPress={() => setShowPicker(false)}
            className="flex-1 bg-muted rounded-lg p-3 items-center"
          >
            <Text className="text-sm font-medium">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleDone}
            className="flex-1 bg-primary rounded-lg p-3 items-center"
          >
            <Text className="text-sm font-medium text-primary-foreground">
              Done
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
