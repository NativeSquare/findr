import { ProfilePictureCarousel } from "@/components/app/profile/profile-picture-carousel";
import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatHeight, formatWeight } from "@/utils/measurements";
import { api } from "@convex/_generated/api";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import {
    Cake,
    ChevronLeft,
    Dumbbell,
    Globe,
    Heart,
    Pencil,
    Repeat,
    Ruler,
    Scale,
    Users,
} from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function calculateAge(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  } catch {
    return null;
  }
}

export default function MyProfile() {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<GorhomBottomSheetModal>(null);
  const user = useQuery(api.users.currentUser);
  const imageUrls = useQuery(api.storage.getImageUrls, {
    storageIds: user?.profilePictures ?? [],
  });

  const measurementSystem = user?.measurementSystem ?? "metric";
  const age = user?.birthDate ? calculateAge(user.birthDate) : null;
  const shouldShowAge = user?.privacy?.hideAge !== true && age !== null;

  // Open bottom sheet by default when page loads
  useEffect(() => {
    if (user) {
      bottomSheetRef.current?.present();
    }
  }, [user]);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  const handleCarouselPress = () => {
    bottomSheetRef.current?.present();
  };

  const handleEditPress = () => {
    router.push("/edit-profile");
  };

  return (
    <View className="flex-1 bg-background">
      {/* Full-screen Image Section */}
      <Pressable
        className="relative w-full h-full"
        onPress={handleCarouselPress}
      >
        {/* Profile Picture Carousel - Full Screen */}
        <ProfilePictureCarousel images={imageUrls ?? []} />

        {/* Top Navigation - Always Visible */}
        <View
          className="absolute left-0 right-0 top-0 z-20 flex-row items-center justify-between px-4"
          style={{ paddingTop: insets.top + 16 }}
        >
          {/* Back Button */}
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/50"
            onPress={() => router.back()}
          >
            <Icon as={ChevronLeft} size={20} className="text-white" />
          </Button>

          {/* Edit Button */}
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/50"
            onPress={handleEditPress}
          >
            <Icon as={Pencil} size={20} className="text-white" />
          </Button>
        </View>
      </Pressable>

      {/* Bottom Sheet with User Info */}
      <BottomSheetModal
        ref={bottomSheetRef}
        enableBackdrop={false}
        snapPoints={["20%", "90%"]}
      >
        <View className="px-6 py-4 gap-6">
          {/* Name */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              {user.name ?? "Unknown"}
            </Text>
          </View>

          {/* ABOUT ME Section */}
          {user.bio && (
            <View className="gap-2">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                About Me
              </Text>
              <View className="bg-secondary/30 rounded-2xl p-4">
                <Text className="text-base leading-6 text-foreground">
                  {user.bio}
                </Text>
              </View>
            </View>
          )}

          {/* USER INFOS Section */}
          {(shouldShowAge || user.height || user.weight) && (
            <View className="gap-2">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                User Infos
              </Text>
              <View className="gap-3">
                {shouldShowAge && (
                  <View className="flex-row items-center gap-2">
                    <Icon as={Cake} size={20} className="text-foreground" />
                    <Text className="text-base text-foreground">
                      {age} years old
                    </Text>
                  </View>
                )}
                {user.height && (
                  <View className="flex-row items-center gap-2">
                    <Icon as={Ruler} size={20} className="text-foreground" />
                    <Text className="text-base text-foreground">
                      {formatHeight(user.height.value, user.height.unit, measurementSystem)}
                    </Text>
                  </View>
                )}
                {user.weight && (
                  <View className="flex-row items-center gap-2">
                    <Icon as={Scale} size={20} className="text-foreground" />
                    <Text className="text-base text-foreground">
                      {formatWeight(user.weight.value, user.weight.unit, measurementSystem)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* EXPECTATIONS Section */}
          {(user.lookingFor?.length || user.position) && (
            <View className="gap-2">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Expectations
              </Text>
              <View className="gap-3">
                {user.lookingFor && user.lookingFor.length > 0 && (
                  <View className="flex-row items-start gap-2">
                    <Icon
                      as={Heart}
                      size={20}
                      className="text-foreground mt-0.5"
                    />
                    <View className="flex-1">
                      <Text className="text-sm text-muted-foreground mb-1">
                        Looking for
                      </Text>
                      <Text className="text-base text-foreground">
                        {user.lookingFor.join(", ")}
                      </Text>
                    </View>
                  </View>
                )}
                {user.position && (
                  <View className="flex-row items-start gap-2">
                    <Icon
                      as={Repeat}
                      size={20}
                      className="text-foreground mt-0.5"
                    />
                    <View className="flex-1">
                      <Text className="text-sm text-muted-foreground mb-1">
                        Position
                      </Text>
                      <Text className="text-base text-foreground">
                        {user.position}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* PHYSICAL Section */}
          {(user.bodyTypes || user.ethnicity) && (
            <View className="gap-2">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Physical
              </Text>
              <View className="gap-3">
                {user.bodyTypes && (
                  <View className="flex-row items-center gap-2">
                    <Icon as={Dumbbell} size={20} className="text-foreground" />
                    <Text className="text-base text-foreground">
                      {user.bodyTypes}
                    </Text>
                  </View>
                )}
                {user.ethnicity && (
                  <View className="flex-row items-center gap-2">
                    <Icon as={Globe} size={20} className="text-foreground" />
                    <Text className="text-base text-foreground">
                      {user.ethnicity}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* IDENTITY Section */}
          {user.orientation && (
            <View className="gap-2">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Identity
              </Text>
              <View className="gap-3">
                <View className="flex-row items-start gap-2">
                  <Icon
                    as={Users}
                    size={20}
                    className="text-foreground mt-0.5"
                  />
                  <View className="flex-1">
                    <Text className="text-sm text-muted-foreground mb-1">
                      Sexual Orientation
                    </Text>
                    <Text className="text-base text-foreground">
                      {user.orientation}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </BottomSheetModal>
    </View>
  );
}
