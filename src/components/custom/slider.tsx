import { THEME } from "@/lib/theme";
import RNSlider from "@react-native-community/slider";
import { useColorScheme } from "nativewind";
import React from "react";
import { StyleSheet } from "react-native";

export type SliderProps = {
  minimumValue: number;
  maximumValue: number;
  value: number;
  onValueChange: (value: number) => void;
  step?: number;
  style?: object;
};

export function Slider({
  minimumValue,
  maximumValue,
  value,
  onValueChange,
  step = 1,
  style,
}: SliderProps) {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? "light"];

  return (
    <RNSlider
      style={[styles.slider, style]}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={step}
      value={value}
      onValueChange={onValueChange}
      minimumTrackTintColor={theme.foreground}
      thumbTintColor={theme.foreground}
    />
  );
}

const styles = StyleSheet.create({
  slider: {
    width: "100%",
    height: 1,
  },
});
