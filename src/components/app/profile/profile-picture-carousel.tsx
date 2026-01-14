import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Dimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { CarouselPagination } from "./carousel-pagination";

export type ProfilePictureCarouselProps = {
  images: string[];
};

export function ProfilePictureCarousel({
  images,
}: ProfilePictureCarouselProps) {
  const progress = useSharedValue(0);
  const carouselRef = React.useRef<ICarouselInstance>(null);

  const onPressPagination = (index: number) => {
    carouselRef.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  };

  const screenDimensions = Dimensions.get("window");
  const screenWidth = screenDimensions.width;
  const screenHeight = screenDimensions.height;

  return (
    <View className="relative w-full h-full">
      {/* Image Display with Carousel */}
      {images.length > 0 ? (
        <Carousel
          ref={carouselRef}
          width={screenWidth}
          height={screenHeight}
          data={images}
          loop={false}
          onProgressChange={progress}
          renderItem={({ item: image, index }) => (
            <View className="h-full w-full" collapsable={false}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  contentFit="contain"
                  style={{
                    width: screenWidth,
                    height: screenHeight,
                    backgroundColor: "rgba(0,0,0,0.1)",
                  }}
                />
              ) : (
                <View className="h-full w-full items-center justify-center bg-secondary/60">
                  <Ionicons
                    name="person"
                    size={80}
                    className="text-muted-foreground"
                  />
                </View>
              )}
            </View>
          )}
        />
      ) : (
        <View className="h-full w-full" collapsable={false}>
          <Avatar
            alt="User's Profile Picture"
            className="h-full w-full items-center justify-center rounded-none bg-secondary/60"
          >
            <AvatarFallback className="h-full w-full bg-secondary/60 rounded-none">
              <Ionicons
                name="person"
                size={80}
                className="text-muted-foreground"
              />
            </AvatarFallback>
          </Avatar>
        </View>
      )}
      {/* Pagination */}
      {images.length > 1 && (
        <View className="absolute left-0 right-0 z-10 pt-safe">
          <CarouselPagination
            progress={progress}
            data={images}
            onPress={onPressPagination}
          />
        </View>
      )}
    </View>
  );
}
