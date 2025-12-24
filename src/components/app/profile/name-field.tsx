import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";

export type NameFieldProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  errorMessage?: string;
};

export function NameField({ 
  label = "Name", 
  value, 
  onChange,
  error = false,
  errorMessage,
}: NameFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Input
        placeholder="John"
        value={value}
        onChangeText={onChange}
        autoCapitalize="words"
        returnKeyType="next"
        className={error ? "border-destructive" : ""}
        aria-invalid={error}
      />
      {error && errorMessage && (
        <Text className="text-sm text-destructive">{errorMessage}</Text>
      )}
    </View>
  );
}
