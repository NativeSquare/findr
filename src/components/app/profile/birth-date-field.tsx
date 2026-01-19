import { CalendarInput } from "@/components/custom/calendar-input";
import { Text } from "@/components/ui/text";
import { getDateYearsAgo } from "@/utils/calculateAge";
import { View } from "react-native";

export type BirthDateFieldProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  errorMessage?: string;
  minAge?: number; // Minimum age required (e.g., 16)
  required?: boolean;
};

export function BirthDateField({
  label = "Date of Birth",
  value,
  onChange,
  error = false,
  errorMessage,
  minAge,
  required = false,
}: BirthDateFieldProps) {
  // Calculate dates based on minimum age requirement
  // If minAge is 16, maximumDate should be 16 years ago (most recent date allowed, makes user exactly 16)
  // minimumDate should be a reasonable date in the past (like 100 years ago)
  const maximumDate = minAge ? getDateYearsAgo(minAge) : new Date();
  const minimumDate = new Date(1900, 0, 1); // Reasonable minimum date (100+ years ago)

  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">
        {label}
        {required && <Text className="text-destructive"> *</Text>}
      </Text>
      <CalendarInput
        value={value}
        onChange={onChange}
        error={error}
        maximumDate={maximumDate} // Can't select dates after 16 years ago (ensures user is at least 16)
        minimumDate={minimumDate} // Reasonable minimum date in the past
        title={label}
      />
      {error && errorMessage && (
        <Text className="text-sm text-destructive">{errorMessage}</Text>
      )}
    </View>
  );
}
