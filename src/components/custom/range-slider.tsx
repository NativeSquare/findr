import { THEME } from "@/lib/theme";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { LayoutChangeEvent, View } from "react-native";

export type RangeSliderProps = {
  minimumValue: number;
  maximumValue: number;
  valueMin: number;
  valueMax: number;
  onValueChange: (min: number, max: number) => void;
  step?: number;
};

export function RangeSlider({
  minimumValue,
  maximumValue,
  valueMin,
  valueMax,
  onValueChange,
  step = 1,
}: RangeSliderProps) {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? "light"];
  const [sliderWidth, setSliderWidth] = useState<number | null>(null);
  const HORIZONTAL_PADDING = 14;
  const onLayout = (event: LayoutChangeEvent) => {
    setSliderWidth(event.nativeEvent.layout.width - HORIZONTAL_PADDING * 2);
  };

  return (
    <View
      style={{
        width: "100%",
        paddingHorizontal: HORIZONTAL_PADDING,
      }}
      onLayout={onLayout}
    >
      {sliderWidth && (
        <MultiSlider
          values={[valueMin, valueMax]}
          min={minimumValue}
          max={maximumValue}
          step={step}
          onValuesChange={(values) => {
            onValueChange(values[0], values[1]);
          }}
          selectedStyle={{
            backgroundColor: theme.foreground,
          }}
          unselectedStyle={{
            backgroundColor: "#3E3E3E",
          }}
          markerStyle={{
            width: 12,
            height: 12,
            borderRadius: 12,
            backgroundColor: theme.foreground,
          }}
          containerStyle={{
            width: "100%",
            height: 1,
          }}
          sliderLength={sliderWidth}
        />
      )}
    </View>
  );
}
