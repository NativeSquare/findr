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

export type WeightFieldProps = {
  label?: string;
  value?: string;
  onChangeWeight?: React.ComponentProps<typeof Input>["onChangeText"];
  onChangeUnit?: React.ComponentProps<typeof Select>["onValueChange"];
};

export function WeightField({
  label = "Weight",
  value,
  onChangeWeight,
  onChangeUnit,
}: WeightFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <View className="flex flex-row items-center gap-2">
        <Input
          keyboardType="numeric"
          value={value}
          onChangeText={onChangeWeight}
          placeholder="70"
          maxLength={3}
          className="flex-1"
        />
        <Select
          defaultValue={{ label: "kg", value: "kg" }}
          onValueChange={onChangeUnit}
        >
          <SelectTrigger className="w-[64px]" disabled={true}>
            <SelectValue placeholder="kg" />
          </SelectTrigger>
          <SelectContent className="w-[64px]">
            <SelectGroup>
              <SelectItem label="kg" value="kg">
                kg
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
    </View>
  );
}
