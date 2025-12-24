import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import * as React from "react";
import { Platform, Pressable, View } from "react-native";
import { Input } from "../ui/input";

export type CalendarInputProps = {
  value?: string; // ISO8601 string (e.g., "2000-01-15T00:00:00Z")
  onChange?: (value: string) => void; // Receives ISO8601 string
  placeholder?: string;
  className?: string;
  placeholderClassName?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  error?: boolean;
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

function dateToISO8601(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T00:00:00Z`;
}

export function CalendarInput({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  className,
  placeholderClassName,
  maximumDate,
  minimumDate,
  error = false,
}: CalendarInputProps) {
  const [showPicker, setShowPicker] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date>(() => {
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch {
        // Invalid date, fall through to default
      }
    }
    // Default to current date
    return new Date();
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
        onChange?.(dateToISO8601(selectedDate));
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
    onChange?.(dateToISO8601(internalDate));
    setShowPicker(false);
  };

  const handlePress = () => {
    setShowPicker(true);
  };

  return (
    <View>
      <Pressable onPress={handlePress}>
        <View className="relative">
          <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Icon as={Calendar} size={20} className="text-muted-foreground" />
          </View>
          <Input
            value={formatDateForDisplay(value)}
            placeholder={placeholder}
            editable={false}
            pointerEvents="none"
            className={cn(
              "pl-10 opacity-100",
              error && "border-destructive",
              className
            )}
            placeholderClassName={placeholderClassName}
            aria-invalid={error}
          />
        </View>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={internalDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
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
