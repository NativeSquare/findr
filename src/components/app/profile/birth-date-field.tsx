import { CalendarInput } from "@/components/custom/calendar-input";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export type BirthDateFieldProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  errorMessage?: string;
};

export function BirthDateField({
  label = "Date of Birth",
  value,
  onChange,
  error = false,
  errorMessage,
}: BirthDateFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <CalendarInput
        value={value}
        onChange={onChange}
        error={error}
        maximumDate={new Date()} // Can't select future dates
        minimumDate={new Date(1900, 0, 1)} // Reasonable minimum date
      />
      {error && errorMessage && (
        <Text className="text-sm text-destructive">{errorMessage}</Text>
      )}
    </View>
  );
}
