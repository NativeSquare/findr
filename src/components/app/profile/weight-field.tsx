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
import type { MeasurementSystem } from "@/utils/measurements";
import { kgToLbs, lbsToKg } from "@/utils/measurements";
import * as React from "react";
import { View } from "react-native";

export type WeightFieldProps = {
  label?: string;
  value?: string;
  unit?: string;
  measurementSystem?: MeasurementSystem;
  onChangeWeight?: (value: string) => void;
  onChangeUnit?: React.ComponentProps<typeof Select>["onValueChange"];
};

export function WeightField({
  label = "Weight",
  value,
  unit = "kg",
  measurementSystem = "metric",
  onChangeWeight,
  onChangeUnit,
}: WeightFieldProps) {
  const [lbsValue, setLbsValue] = React.useState("");

  // Sync lbs field when value changes (for kg to lbs conversion)
  React.useEffect(() => {
    if (measurementSystem === "imperial" && value && unit === "kg") {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > 0) {
        setLbsValue(kgToLbs(numValue).toString());
      }
    }
  }, [value, unit, measurementSystem]);

  const handleLbsChange = (newLbs: string) => {
    setLbsValue(newLbs);
    const lbs = Number(newLbs) || 0;
    const kg = lbsToKg(lbs);
    onChangeWeight?.(kg.toString());
  };

  if (measurementSystem === "imperial") {
    return (
      <View className="gap-2">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <View className="flex flex-row items-center gap-2">
          <Input
            keyboardType="numeric"
            value={lbsValue}
            onChangeText={handleLbsChange}
            placeholder="154"
            maxLength={3}
            className="flex-1"
          />
          <Text className="text-muted-foreground w-[64px] text-center">lbs</Text>
        </View>
      </View>
    );
  }

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
