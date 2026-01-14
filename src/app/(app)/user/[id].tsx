import { ProfilePictureCarousel } from "@/components/app/profile/profile-picture-carousel";
import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Text } from "@/components/ui/text";
import { usePresence } from "@convex-dev/presence/react-native";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import {
  Cake,
  ChevronLeft,
  Dumbbell,
  Globe,
  Heart,
  MapPin,
  MessageCircle,
  Repeat,
  Ruler,
  Scale,
  Smile,
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

const EMOJI_OPTIONS = ["🍸", "❤️‍🔥", "❌", "😈", "⚡"];

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: Id<"users"> }>();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<GorhomBottomSheetModal>(null);
  const currentUser = useQuery(api.users.currentUser);
  const user = useQuery(api.users.get, { id });
  const imageUrls = useQuery(api.storage.getImageUrls, {
    storageIds: user?.profilePictures ?? [],
  });
  const distanceInMeters = useQuery(
    api.geospatial.getDistanceBetweenUsers,
    currentUser?._id && id
      ? {
          currentUserId: currentUser._id,
          targetUserId: id as any,
        }
      : "skip"
  );
  const presenceState = usePresence(
    api.presence,
    "public",
    currentUser?._id ?? ""
  );

  const userPresenceState = (presenceState || []).find(
    (state) => state.userId === id
  );
  const isOnline =
    user?.privacy?.hideOnlineStatus === true
      ? false
      : (userPresenceState?.online ?? false);

  const age = user?.birthDate ? calculateAge(user.birthDate) : null;
  const shouldShowAge = user?.privacy?.hideAge !== true && age !== null;
  const distance =
    user?.privacy?.hideDistance === true
      ? null
      : distanceInMeters !== null && distanceInMeters !== undefined
        ? (distanceInMeters / 1000).toFixed(1)
        : null;

  const toggleFavorite = useMutation(api.users.toggleFavorite);
  const isFavorite = useQuery(
    api.users.isFavorite,
    currentUser?._id && id ? { userId: id } : "skip"
  );
  const recordView = useMutation(api.views.recordView);
  const sendTap = useMutation(api.taps.sendTap);
  const existingTap = useQuery(
    api.taps.getTap,
    currentUser?._id && id
      ? { fromUserId: currentUser._id, toUserId: id }
      : "skip"
  );

  // Record view when profile is viewed
  useEffect(() => {
    if (currentUser?._id && id && currentUser._id !== id) {
      recordView({ toUserId: id }).catch((error) => {
        console.error("Error recording view:", error);
      });
    }
  }, [currentUser?._id, id, recordView]);

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

  const handleMessagePress = () => {
    if (!currentUser?._id || !id) return;
    if (currentUser._id === id) {
      console.error("Cannot message yourself");
      return;
    }
    bottomSheetRef.current?.dismiss();
    router.push(`/chat/${id}`);
  };

  const handleFavoritePress = async () => {
    if (!currentUser?._id) return;
    if (currentUser._id === id) {
      console.error("Cannot favorite yourself");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await toggleFavorite({ userId: id });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleTapPress = async (emoji: string) => {
    if (!currentUser?._id || !id) return;
    if (currentUser._id === id) {
      console.error("Cannot send tap to yourself");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await sendTap({ toUserId: id, emoji });
    } catch (error) {
      console.error("Error sending tap:", error);
    }
  };

  const handleCarouselPress = () => {
    bottomSheetRef.current?.present();
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

          {/* Action Buttons */}
          <View className="flex-row items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50"
              onPress={handleFavoritePress}
            >
              <Icon
                as={Heart}
                size={20}
                className={isFavorite === true ? "text-red-500" : "text-white"}
                fill={isFavorite === true ? "currentColor" : "none"}
              />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-black/50"
                >
                  {existingTap?.emoji ? (
                    <Text className="text-xl">{existingTap.emoji}</Text>
                  ) : (
                    <Icon as={Smile} size={20} className="text-white" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-auto p-3">
                <View className="flex-row flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Pressable
                      key={emoji}
                      onPress={() => handleTapPress(emoji)}
                      className="w-12 h-12 items-center justify-center rounded-lg active:opacity-70"
                    >
                      <Text className="text-3xl">{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </PopoverContent>
            </Popover>
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50"
              onPress={handleMessagePress}
            >
              <Icon as={MessageCircle} size={20} className="text-white" />
            </Button>
          </View>
        </View>
      </Pressable>

      {/* Bottom Sheet with User Info */}
      <BottomSheetModal
        ref={bottomSheetRef}
        enableBackdrop={false}
        snapPoints={["20%", "90%"]}
      >
        <View className="px-6 py-4 gap-6">
          {/* Distance */}
          {distance !== null && (
            <View className="flex-row items-center gap-2">
              <Icon as={MapPin} size={16} className="text-muted-foreground" />
              <Text className="text-sm text-muted-foreground">
                {distance} Km Away
              </Text>
            </View>
          )}

          {/* Online Status & Name */}
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <View
                className={
                  isOnline
                    ? "size-3 shrink-0 rounded-full bg-green-500"
                    : "size-3 shrink-0 rounded-full bg-gray-500"
                }
              />
              <Text className="text-sm text-muted-foreground">
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
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
                      {user.height.value} {user.height.unit}
                    </Text>
                  </View>
                )}
                {user.weight && (
                  <View className="flex-row items-center gap-2">
                    <Icon as={Scale} size={20} className="text-foreground" />
                    <Text className="text-base text-foreground">
                      {user.weight.value} {user.weight.unit}
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
