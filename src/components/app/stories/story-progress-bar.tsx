import React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export type StoryProgressBarProps = {
  /** Total number of story segments */
  total: number;
  /** Current active story index (0-based) */
  currentIndex: number;
  /** Progress of the current segment (0 to 1) */
  progress: Animated.SharedValue<number>;
};

function ProgressSegment({
  state,
  progress,
}: {
  state: "completed" | "active" | "upcoming";
  progress: Animated.SharedValue<number>;
}) {
  const fillStyle = useAnimatedStyle(() => {
    if (state === "completed") {
      return { width: "100%" };
    }
    if (state === "upcoming") {
      return { width: "0%" };
    }
    // Active segment
    return {
      width: withTiming(`${progress.value * 100}%`, {
        duration: 100,
        easing: Easing.linear,
      }),
    };
  });

  return (
    <View
      className="flex-1 overflow-hidden rounded-full"
      style={{ height: 2, backgroundColor: "rgba(255,255,255,0.3)" }}
    >
      <Animated.View
        className="rounded-full"
        style={[{ height: "100%", backgroundColor: "#fff" }, fillStyle]}
      />
    </View>
  );
}

export function StoryProgressBar({
  total,
  currentIndex,
  progress,
}: StoryProgressBarProps) {
  return (
    <View className="flex-row gap-1 px-2 pt-2">
      {Array.from({ length: total }).map((_, index) => {
        let state: "completed" | "active" | "upcoming";
        if (index < currentIndex) {
          state = "completed";
        } else if (index === currentIndex) {
          state = "active";
        } else {
          state = "upcoming";
        }

        return (
          <ProgressSegment key={index} state={state} progress={progress} />
        );
      })}
    </View>
  );
}
