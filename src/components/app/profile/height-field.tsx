import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";

export type HeightFieldProps = {
  label?: string;
  value?: string;
  onChangeHeight?: React.ComponentProps<typeof Input>["onChangeText"];
  onChangeUnit?: React.ComponentProps<typeof Select>["onValueChange"];
};

export function HeightField({
  label = "Height",
  value,
  onChangeHeight,
  onChangeUnit,
}: HeightFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <View className="flex flex-row items-center gap-2">
        <Input
          keyboardType="numeric"
          value={value}
          onChangeText={onChangeHeight}
          placeholder="175"
          maxLength={3}
          className="flex-1"
        />
        <Select
          defaultValue={{ label: "cm", value: "cm" }}
          onValueChange={onChangeUnit}
        >
          <SelectTrigger className="w-[64px]" disabled={true}>
            <SelectValue placeholder="cm" />
          </SelectTrigger>
          <SelectContent className="w-[64px]">
            <SelectGroup>
              <SelectItem label="cm" value="cm">
                cm
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
    </View>
  );
}
