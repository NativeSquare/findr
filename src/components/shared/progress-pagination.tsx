import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

export type ProgressPaginationProps = {
  progress: SharedValue<number>;
  data: unknown[];
  width?: number;
  height?: number;
};

export function ProgressPagination({
  progress,
  data,
  width = 200,
  height = 4,
}: ProgressPaginationProps) {
  const totalItems = data.length;
  const indicatorWidth = 20;

  // Calculate the fill width (ends where indicator starts)
  const fillStyle = useAnimatedStyle(() => {
    const position = interpolate(
      progress.value,
      [0, totalItems - 1],
      [0, width - indicatorWidth],
      Extrapolation.CLAMP
    );

    return {
      width: position,
    };
  });

  // Calculate the indicator position
  const indicatorStyle = useAnimatedStyle(() => {
    const position = interpolate(
      progress.value,
      [0, totalItems - 1],
      [0, width - indicatorWidth],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX: position }],
    };
  });

  return (
    <View
      style={{
        width,
        height,
        position: "relative",
      }}
    >
      {/* Unfilled track - very dark gray */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: "#0a0a0a",
          borderRadius: height / 2,
        }}
      />

      {/* Filled track - darker gray with gradient */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            height,
            borderRadius: height / 2,
            overflow: "hidden",
          },
          fillStyle,
        ]}
      >
        <LinearGradient
          colors={["#404040", "#2a2a2a", "#353535"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </Animated.View>

      {/* Indicator/handle - light gray with rounded left corners */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            width: indicatorWidth,
            height,
            borderRadius: height / 2,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            overflow: "hidden",
            zIndex: 10,
          },
          indicatorStyle,
        ]}
      >
        <LinearGradient
          colors={["#e8e8e8", "#c8c8c8", "#d8d8d8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </Animated.View>
    </View>
  );
}
