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
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Heart,
  MapPin,
  MessageCircle,
  Smile,
} from "lucide-react-native";
import React, { useEffect } from "react";
import { Pressable, ScrollView, View } from "react-native";
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

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: Id<"users"> }>();
  const insets = useSafeAreaInsets();
  const currentUser = useQuery(api.users.currentUser);
  const user = useQuery(api.users.get, { id });
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

  const sendTap = useMutation(api.taps.sendTap);
  const sentTap = useQuery(
    api.taps.getTap,
    currentUser?._id && id
      ? { fromUserId: currentUser._id, toUserId: id }
      : "skip"
  );
  const toggleFavorite = useMutation(api.users.toggleFavorite);
  const isFavorite = useQuery(
    api.users.isFavorite,
    currentUser?._id && id ? { userId: id } : "skip"
  );
  const recordView = useMutation(api.views.recordView);

  const emojis = ["🍸", "❤️‍🔥", "❌", "😈", "⚡"];

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

  const handleEmojiSelect = async (emoji: string) => {
    if (!currentUser?._id) return;
    if (currentUser._id === id) {
      console.error("Cannot send tap to yourself");
      return;
    }

    try {
      await sendTap({
        toUserId: id,
        emoji,
      });
    } catch (error) {
      console.error("Error sending tap:", error);
    }
  };

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

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Section */}
        <View className="relative">
          <ProfilePictureCarousel images={user.profilePictures ?? []} />
          {/* Top Navigation */}
          <View
            className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4"
            style={{ paddingTop: insets.top + 16 }}
          >
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50"
              onPress={() => router.back()}
            >
              <Icon as={ChevronLeft} size={20} className="text-white" />
            </Button>
            <View className="flex-row gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-black/50"
                  >
                    {sentTap?.emoji ? (
                      <Text className="text-xl">{sentTap.emoji}</Text>
                    ) : (
                      <Icon as={Smile} size={20} className="text-white" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  align="end"
                  className="w-auto p-1.5"
                >
                  <View className="flex-row gap-2">
                    {emojis.map((emoji) => (
                      <Pressable
                        key={emoji}
                        onPress={() => handleEmojiSelect(emoji)}
                        className="h-10 w-10 items-center justify-center rounded-lg active:bg-muted"
                      >
                        <Text className="text-xl">{emoji}</Text>
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
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/50"
                onPress={handleFavoritePress}
              >
                <Icon
                  as={Heart}
                  size={20}
                  className={
                    isFavorite === true ? "text-red-500" : "text-white"
                  }
                  fill={isFavorite === true ? "currentColor" : "none"}
                />
              </Button>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View className="px-4 pt-4">
          {/* User General Info */}
          <View className="mb-4 gap-2">
            <View className="flex-row items-center gap-2">
              <View
                className={
                  isOnline
                    ? "size-2 shrink-0 rounded-full bg-green-500"
                    : "size-2 shrink-0 rounded-full bg-gray-500"
                }
              />
              <Text className="text-2xl font-semibold text-white">
                {user.name ?? "Unknown"}
                {age !== null && `, ${age}`}
              </Text>
            </View>
            {distance !== null && (
              <View className="flex-row items-center gap-1">
                <Icon as={MapPin} size={14} className="text-muted-foreground" />
                <Text className="text-sm text-muted-foreground">
                  {distance} km away
                </Text>
              </View>
            )}
          </View>

          {/* Bio Section */}
          <View className="mb-6 gap-2">
            <Text className="text-xs uppercase tracking-wide text-muted-foreground">
              ABOUT ME
            </Text>
            <Text
              className={`text-base leading-6 ${
                user.bio ? "text-white" : "text-muted-foreground"
              }`}
            >
              {user.bio || "No bio available"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
