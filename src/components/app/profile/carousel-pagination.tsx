import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export type CarouselPaginationProps = {
  progress: SharedValue<number>;
  data: any[];
  onPress?: (index: number) => void;
};

export function CarouselPagination({
  progress,
  data,
  onPress,
}: CarouselPaginationProps) {
  return (
    <View className="flex-row gap-1 px-4">
      {data.map((_, index) => (
        <PaginationItem
          key={index}
          index={index}
          progress={progress}
          length={data.length}
          onPress={() => onPress?.(index)}
        />
      ))}
    </View>
  );
}

type PaginationItemProps = {
  index: number;
  progress: SharedValue<number>;
  length: number;
  onPress: () => void;
};

function PaginationItem({
  index,
  progress,
  length,
  onPress,
}: PaginationItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progress.value,
      [index - 1, index, index + 1],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    return {
      width: `${width * 100}%`,
    };
  }, [index, progress]);

  return (
    <Pressable
      onPress={onPress}
      className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
    >
      <Animated.View
        style={animatedStyle}
        className="h-full rounded-full bg-white"
      />
    </Pressable>
  );
}
