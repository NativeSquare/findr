import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export type AgeFieldProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function AgeField({ label = "Age", value, onChange }: AgeFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Input
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
        placeholder={"18"}
        maxLength={3}
      />
    </View>
  );
}
