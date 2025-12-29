import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { Pagination } from "react-native-reanimated-carousel";

export type ProfilePictureCarouselProps = {
  images: string[];
};

export function ProfilePictureCarousel({
  images,
}: ProfilePictureCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState<
    number | null
  >(null);
  const carouselRef = useRef<any>(null);
  const fullScreenCarouselRef = useRef<any>(null);
  const progress = useSharedValue(0);
  const fullScreenProgress = useSharedValue(0);

  const hasImages = images && images.length > 0;

  const handleImagePress = () => {
    if (hasImages) {
      setFullScreenImageIndex(currentIndex);
    }
  };

  // Calculate full-screen image dimensions (1:1 aspect ratio, centered)
  const screenDimensions = Dimensions.get("window");
  const screenWidth = screenDimensions.width;
  const screenHeight = screenDimensions.height;
  const imageSize = Math.min(screenWidth, screenHeight);

  // Sync full-screen carousel when opening
  React.useEffect(() => {
    if (fullScreenImageIndex !== null && fullScreenCarouselRef.current) {
      fullScreenCarouselRef.current.scrollTo({
        count: fullScreenImageIndex - fullScreenProgress.value,
        animated: false,
      });
      fullScreenProgress.value = fullScreenImageIndex;
    }
  }, [fullScreenImageIndex]);

  return (
    <>
      <View className="relative h-[60vh] w-full">
        {/* Image Display with Carousel */}
        {hasImages ? (
          <>
            <Carousel
              ref={carouselRef}
              width={screenWidth}
              height={screenDimensions.height * 0.6}
              data={images}
              loop={false}
              onProgressChange={progress}
              onSnapToItem={setCurrentIndex}
              renderItem={({ item: image, index }) => (
                <View className="h-full w-full" collapsable={false}>
                  <Pressable
                    onPress={handleImagePress}
                    className="h-full w-full"
                  >
                    <Avatar
                      alt="User's Profile Picture"
                      className="h-full w-full items-center justify-center rounded-none bg-secondary/60"
                    >
                      <AvatarImage
                        source={{ uri: image }}
                        className="h-full w-full"
                      />
                      <AvatarFallback className="h-full w-full bg-secondary/60 rounded-none">
                        <Ionicons
                          name="person"
                          size={80}
                          className="text-muted-foreground"
                        />
                      </AvatarFallback>
                    </Avatar>
                  </Pressable>
                </View>
              )}
            />
            {/* Pagination */}
            {images.length > 1 && (
              <View className="absolute left-0 right-0 top-0 items-center justify-center pt-4">
                <Pagination.Basic
                  progress={progress}
                  data={images}
                  dotStyle={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                  }}
                  activeDotStyle={{
                    width: 24,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "white",
                  }}
                />
              </View>
            )}
          </>
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
      </View>

      {/* Full Screen Image Viewer */}
      <Dialog
        open={fullScreenImageIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setFullScreenImageIndex(null);
          }
        }}
      >
        <DialogContent className="h-full max-h-full w-full max-w-full bg-black p-0 border-0 rounded-none">
          {fullScreenImageIndex !== null && hasImages && (
            <View className="relative h-full w-full items-center justify-center">
              <Carousel
                ref={fullScreenCarouselRef}
                width={screenWidth}
                height={screenHeight}
                data={images}
                loop={false}
                defaultIndex={fullScreenImageIndex}
                onProgressChange={fullScreenProgress}
                onSnapToItem={setFullScreenImageIndex}
                renderItem={({ item: image }) => (
                  <View
                    className="h-full w-full items-center justify-center"
                    collapsable={false}
                  >
                    {/* Centered 1:1 Image */}
                    <Avatar
                      alt="Full Screen Profile Picture"
                      className="items-center justify-center rounded-none bg-black"
                      style={{
                        width: imageSize,
                        height: imageSize,
                      }}
                    >
                      <AvatarImage
                        source={{ uri: image }}
                        style={{
                          width: imageSize,
                          height: imageSize,
                        }}
                      />
                      <AvatarFallback
                        className="bg-black rounded-none"
                        style={{
                          width: imageSize,
                          height: imageSize,
                        }}
                      >
                        <Ionicons
                          name="person"
                          size={80}
                          className="text-muted-foreground"
                        />
                      </AvatarFallback>
                    </Avatar>
                  </View>
                )}
              />

              {/* Full Screen Pagination */}
              {images.length > 1 && (
                <View className="absolute bottom-8 left-0 right-0 items-center justify-center">
                  <Pagination.Basic
                    progress={fullScreenProgress}
                    data={images}
                    dotStyle={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                    }}
                    activeDotStyle={{
                      width: 24,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: "white",
                    }}
                  />
                </View>
              )}
            </View>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
