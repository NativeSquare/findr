import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { View } from "react-native";

export type BioFieldProps = {
  label?: string;
  maxLength?: number;
  value?: string;
  onChange?: (value: string) => void;
};

export function BioField({
  label = "Bio",
  value,
  onChange,
  maxLength = 500,
}: BioFieldProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <Text className="text-xs text-muted-foreground self-end">
          {value?.length || 0}/{maxLength}
        </Text>
      </View>
      <Textarea
        placeholder="Share a little about yourself"
        value={value}
        onChangeText={onChange}
        className="min-h-32"
        maxLength={maxLength}
      />
    </View>
  );
}
