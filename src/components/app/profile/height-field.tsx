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
import { cmToFeetInches, feetInchesToCm } from "@/utils/measurements";
import * as React from "react";
import { View } from "react-native";

export type HeightFieldProps = {
  label?: string;
  value?: string;
  unit?: string;
  measurementSystem?: MeasurementSystem;
  onChangeHeight?: (value: string) => void;
  onChangeUnit?: React.ComponentProps<typeof Select>["onValueChange"];
};

export function HeightField({
  label = "Height",
  value,
  unit = "cm",
  measurementSystem = "metric",
  onChangeHeight,
  onChangeUnit,
}: HeightFieldProps) {
  const [feet, setFeet] = React.useState("");
  const [inches, setInches] = React.useState("");
  const isLocalChangeRef = React.useRef(false);

  // Sync imperial fields when value changes externally (e.g. metric to imperial switch)
  React.useEffect(() => {
    if (isLocalChangeRef.current) {
      isLocalChangeRef.current = false;
      return;
    }
    if (measurementSystem === "imperial" && value && unit === "cm") {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > 0) {
        const converted = cmToFeetInches(numValue);
        setFeet(converted.feet.toString());
        setInches(converted.inches.toString());
      }
    }
  }, [value, unit, measurementSystem]);

  const handleFeetChange = (newFeet: string) => {
    setFeet(newFeet);
    const f = Number(newFeet) || 0;
    const i = Number(inches) || 0;
    const cm = feetInchesToCm(f, i);
    isLocalChangeRef.current = true;
    onChangeHeight?.(cm.toString());
  };

  const handleInchesChange = (newInches: string) => {
    setInches(newInches);
    const f = Number(feet) || 0;
    const i = Number(newInches) || 0;
    const cm = feetInchesToCm(f, i);
    isLocalChangeRef.current = true;
    onChangeHeight?.(cm.toString());
  };

  if (measurementSystem === "imperial") {
    return (
      <View className="gap-2">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <View className="flex flex-row items-center gap-2">
          <View className="flex-row items-center gap-1 flex-1">
            <Input
              keyboardType="numeric"
              value={feet}
              onChangeText={handleFeetChange}
              placeholder="5"
              maxLength={1}
              className="flex-1"
            />
            <Text className="text-muted-foreground">ft</Text>
          </View>
          <View className="flex-row items-center gap-1 flex-1">
            <Input
              keyboardType="numeric"
              value={inches}
              onChangeText={handleInchesChange}
              placeholder="10"
              maxLength={2}
              className="flex-1"
            />
            <Text className="text-muted-foreground">in</Text>
          </View>
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
