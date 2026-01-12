import { ProfilePictureCarousel } from "@/components/app/profile/profile-picture-carousel";
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
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Heart, MessageCircle, Smile } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
  const [showInfo, setShowInfo] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
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
    router.push(`/chat/${id}`);
  };

  const handleFavoritePress = async () => {
    if (!currentUser?._id) return;
    if (currentUser._id === id) {
      console.error("Cannot favorite yourself");
      return;
    }

    try {
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
      await sendTap({ toUserId: id, emoji });
      setPopoverOpen(false);
    } catch (error) {
      console.error("Error sending tap:", error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Full-screen Image Section */}
      <Pressable
        className="relative w-full h-full"
        onPress={() => setShowInfo((prev) => !prev)}
      >
        {/* Profile Picture Carousel - Full Screen */}
        <ProfilePictureCarousel images={imageUrls ?? []} />

        {/* Top Navigation */}
        {showInfo && (
          <View
            className="absolute left-0 right-0 top-0 z-20 flex-row items-center justify-between px-4"
            style={{ paddingTop: insets.top + 16 }}
          >
            <View className="flex-row items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/50"
                onPress={() => router.back()}
              >
                <Icon as={ChevronLeft} size={20} className="text-white" />
              </Button>
            </View>
          </View>
        )}

        {/* Right Side Action Buttons */}
        {showInfo && (
          <View
            className="absolute right-4 z-20 flex-col gap-3"
            style={{ bottom: insets.bottom + 140 }}
          >
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-full bg-black/50"
              onPress={handleFavoritePress}
            >
              <Icon
                as={Heart}
                size={22}
                className={isFavorite === true ? "text-red-500" : "text-white"}
                fill={isFavorite === true ? "currentColor" : "none"}
              />
            </Button>
            <Popover onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-black/50"
                >
                  {existingTap?.emoji ? (
                    <Text className="text-2xl">{existingTap.emoji}</Text>
                  ) : (
                    <Icon as={Smile} size={22} className="text-white" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="center" className="w-auto p-3">
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
              className="h-12 w-12 rounded-full bg-black/50"
              onPress={handleMessagePress}
            >
              <Icon as={MessageCircle} size={22} className="text-white" />
            </Button>
          </View>
        )}

        {/* Bottom Overlay with User Info */}
        {showInfo && (
          <View
            className="absolute bottom-0 left-0 right-0 z-10"
            style={{ height: 250 }}
            pointerEvents="box-none"
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.95)"]}
              locations={[0, 0.3, 1]}
              style={{
                flex: 1,
                paddingBottom: insets.bottom + 20,
                paddingTop: 60,
                paddingHorizontal: 20,
                justifyContent: "flex-end",
              }}
            >
              {/* Distance */}
              {distance !== null && (
                <Text className="text-sm text-white mb-2">
                  {distance} Km Away
                </Text>
              )}

              {/* Name, Age, and Verified Badge */}
              <View className="flex-row items-center gap-2 mb-3">
                <View
                  className={
                    isOnline
                      ? "size-3 shrink-0 rounded-full bg-green-500"
                      : "size-3 shrink-0 rounded-full bg-gray-500"
                  }
                />
                <Text className="text-3xl font-bold text-white">
                  {user.name ?? "Unknown"}
                  {age !== null && `, ${age}`}
                </Text>
              </View>

              {/* Bio */}
              {user.bio ? (
                <Text
                  className="text-base leading-6 text-white"
                  numberOfLines={3}
                >
                  {user.bio}
                </Text>
              ) : (
                <Text className="text-base leading-6 text-white/70">
                  No bio available
                </Text>
              )}
            </LinearGradient>
          </View>
        )}
      </Pressable>
    </View>
  );
}
